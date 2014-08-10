package com.vijayrc.storm.wordcount;

import backtype.storm.Config;
import backtype.storm.LocalCluster;
import backtype.storm.topology.TopologyBuilder;
import backtype.storm.tuple.Fields;
import com.vijayrc.storm.MyTopology;

import static backtype.storm.utils.Utils.sleep;

public class WordCountTopology implements MyTopology {

    @Override
    public void run() throws Exception {
        TopologyBuilder builder = new TopologyBuilder();
        builder.setSpout("s1",new LineSpout(),1);
        builder.setBolt("b1",new SplitBolt(),10).shuffleGrouping("s1");
        builder.setBolt("b2",new CountBolt(),10).fieldsGrouping("b1",new Fields("word"));

        Config config = new Config();
        LocalCluster cluster = new LocalCluster();
        cluster.submitTopology("myTopology",config,builder.createTopology());
        sleep(10000);
        cluster.killTopology("myTopology");
        cluster.shutdown();
    }

    @Override
    public String name() {
        return "wordcount";
    }
}
