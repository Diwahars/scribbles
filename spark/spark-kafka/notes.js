http://spark.apache.org/docs/latest/streaming-programming-guide.html
https://databricks.com/blog/2015/03/30/improvements-to-kafka-integration-of-spark-streaming.html
http://blog.cloudera.com/blog/2015/03/exactly-once-spark-streaming-from-apache-kafka/
http://www.michael-noll.com/blog/2014/10/01/kafka-spark-streaming-integration-example-tutorial/

'kafka'
        bin/zookeeper-server-start.sh config/zookeeper.properties
        bin/kafka-server-start.sh config/server.properties

        #single-node:
        bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test
        bin/kafka-topics.sh --list --zookeeper localhost:2181
        bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test
        bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic test --from-beginning

'Old Receiver Approach'
    At a high-level, the earlier Kafka integration worked with Write Ahead Logs (WALs) as follows:
        The Kafka data is continuously received by 'Kafka Receivers running in the Spark workers/executors'.
        This used the 'high-level consumer API of Kafka'.
        The received data is stored in Spark’s worker/executor memory as well as to the WAL (replicated on HDFS).
        The 'Kafka Receiver updated Kafka’s offsets to Zookeeper only after the data has been persisted to the log'.
        The information about the received data and its WAL locations is also stored reliably.
        On failure, this information is used to re-read the data and continue processing.
    'problems'
        2 phase commit: Executor memory + WAL.
        A message written to WAL, would not have sent a acknowledgenent to ZK, leading to duplicate processing

'New Direct Approach w/o WAL and Receivers'
        Instead of receiving the data continuously using Receivers and storing it in a WAL, we simply decide at the beginning of every batch interval what is the range of offsets to consume.
        Later, when each batch’s jobs are executed, the data corresponding to the offset ranges is read from Kafka for processing (similar to how HDFS files are read).
        Kafka 'Simple Consumer' is used.
        These offsets are also saved reliably (with checkpoints) and used to recompute the data to recover from failures.
        Direct API eliminates the need for both WALs and Receivers for Kafka, while ensuring that each Kafka record is effectively received by Spark Streaming exactly once.
        1:1 mapping with kafka and RDD partitions

        DirectKafkaInputStream runs on driver, reads batch offsets
        KafkaRDD runs on executors, reads the corresponding batch messages

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 'API'
-****-

'KafkaRDD'
    Recall that an RDD is defined by:
            A method to divide the work into partitions (getPartitions).
            A method to do the work for a given partition (compute).
            A list of parent RDDs. KafkaRDD is an input, not a transformation, so it has no parents.
            Optionally, a partitioner defining how keys are hashed. KafkaRDD doesn’t define one.
            Optionally, a list of preferred hosts for a given partition, in order to push computation to where the data is (getPreferredLocations).

    Takes in a cluster of Kafka of kafka brokers
    Maps 1 KafkaRDD/1 partition/1 topic/1 offset range


    methods:
    1'getPartitions' method of KafkaRDD takes each OffsetRange in the array and turns it into an RDD:
    1:1 correspondence between Kafka partition and RDD partition.
    offsetRanges can also be fed into a overloaded constructor

    2'getPreferredLocations' method uses the Kafka leader for the given partition as the preferred host.

    3 'compute' runs inside the spark executor process
    keeps fetching the messages from kafka using 'MessageAndMetadata.messageHandler' to user-defined type, default being Tuple[key, value]
    offset ranges are defined in advance on the driver, then read directly from Kafka by executors, the messages returned by a particular KafkaRDD are 'deterministic'
    Safe to re-try a task if it fails. If a Kafka leader is lost, for instance, the compute method will just sleep for the amount of time defined by the refresh.leader.backoff.ms

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

'DirectKafkaInputStream'

    The KafkaRDD returned by KafkaUtils.createRDD is usable in batch jobs if you have existing code to obtain and manage offsets.
    In most cases however, you’ll probably be using KafkaUtils.createDirectStream, which returns a DirectKafkaInputDStream.
    Similar to an RDD, a DStream is defined by:

        A list of parent DStreams. Again, this is an input DStream, not a transformation, so it has no parents.
        A time interval at which the stream will generate batches. This stream uses the interval of the streaming context.
        A method to generate an RDD for a given time interval (compute)

    The compute method runs on the driver.
    It connects to the leader for each topic and partition, not to read messages, but just to get the latest available offset.
    It then defines a KafkaRDD with offset ranges spanning from the ending point of the last batch until the latest leader offsets.

     three choices of delivery options
         1 Don’t worry about it if you don’t care about lost or duplicated messages, and just restart the stream from the earliest or latest offset.
         2 Checkpoint the stream, in which case the offset ranges (not the messages, just the offset range definitions) will be stored in the checkpoint.
         3 Store the offset ranges yourself, and provide the correct starting offsets when restarting the stream.

    No consumer offsets are stored in ZooKeeper.
    If you want interop with existing Kafka monitoring tools that talk to ZK directly, you’ll need to store the offsets into ZK yourself
    (this doesn’t mean it needs to be your system of record for offsets, you can just duplicate them there).

     1 consumer delivery semantics are up to you, not Kafka.
     2 understand that Spark does not guarantee exactly-once semantics for output actions.
        When the Spark streaming guide talks about exactly-once, it’s only referring to a given item in an RDD being included in a calculated value once, in a purely functional sense.
        Any side-effecting output operations (i.e. anything you do in foreachRDD to save the result) may be repeated, because any stage of the process might fail and be retried.
     3 understand that Spark checkpoints may not be recoverable, for instance in cases where you need to change the application code in order to get the stream restarted.
        This situation may improve by 1.4

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
'Notes on old Receiver Approach'

if a topic has N partitions, then your application can only consume this topic with a maximum of N threads in parallel.
All consumers that are part of the same consumer group share the burden of reading from a given Kafka topic,
Only a maximum of N (= number of partitions) threads across all the consumers in the same group will be able to read from the topic.
Any excess threads will sit idle - 'point'
Only one consumer is guranteed to receive a message in a group, no duplicate receipt
'point': if all consumers belong to same group, they are load balanced within group for every message
'broadcast': if all consumers belong to different groups , they are distributed across groups for every message

1 'Read parallellism'
    Two options
     1.1 'Increase the number of Dstreams' (KafkaUtils.createStream) across many machines as reading is network-io dependent.
             The streams share the same consumer group, so the kafka partitions are divided among them.
     1.2 'increase the number of threads inside a Dstream' - loading a single machine more by reading from multiple partitions of a topic
     combine 1.1, 1.2 to make N streams with 1 thread for N partitions in 1 topic to maximize throughput.

2 'Processing parallelism'
    After getting the streams RDDs, use it as such,or use 'union','coalesce','repartition' according to your needs.

3 'Writing to kafka'
    Best to use a pooled producers to avoid swarming connections  
