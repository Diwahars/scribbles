MYSQL:
-------*
sudo yum install mysql

sudo service mysqld start
sudo service mysqld stop
sudo service mysqld status

mysql -u root 
mysql> show databases;
mysql> use mobile_deals;
mysql> show tables;
mysql> select * from handset;

sudo su root
mysqladmin --version
mysqladmin variables

mysqladmin -u root password "shravan210"
mysql -u root -p
Enter password: 
mysql> exit

#add user------------------------------------------------------------------------------------------
#option-1 
mysql> use mysql;
mysql> INSERT INTO user (host, user, password, select_priv, insert_priv, update_priv) 
		VALUES ('localhost', 'guest', PASSWORD('guest123'), 'Y', 'Y', 'Y');
mysql> FLUSH PRIVILEGES; #reload the grant tables.
mysql> SELECT host, user, password FROM user WHERE user = 'guest'; 
+---- -------+---------+------------------+
| host      | user    | password         |
+-----------+---------+------------------+
| localhost | guest | 6f8c114b58f2ce9e |
+-----------+---------+------------------+
1 row in set (0.00 sec)
mysql -u guest -p

#option-2
GRANT SELECT,INSERT,UPDATE on mobile_deals.* to 'rekha'@'localhost' IDENTIFIED BY 'wifey';
mysql -u rekha -p 


#data types------------------------------------------------------------------------------------------
smallint, int, mediumint, bigint
float(m,d), double(m,d), decimal(m,d) => m-length, d-decimals (10,2)(16,4) defaults, this does not affect storage, just display in client utilities
char(20), varchar(20)
text, blob (tiny|medium|long)=> large binary/text content
date => yyyy-mm-dd
datetime => yyyy-mm-dd HH:MM:ss
time => HH:MM:ss
timestamp => yyyymmddHHMMss (display format, but stores seconds from jan 1 1970 GMT)
enum('a','b')
INTEGER, BOOL, and NUMERIC are alias types

#commands------------------------------------------------------------------------------------------
mysql>show databases;
mysql>show tables;
mysql>show columns from <table-name>;
mysql>show index from <table-name>;
mysql>show table status like 'handset'\G
mysql>show create table handset\G;
mysql>show variable like 'AUTOCOMMIT';

mysql>create database <db-name>;
mysql>drop database <db-name>;
mysql>create table handsets(name varchar(20) NOT NULL PRIMARY KEY, price integer) TYPE=InnoDB; #innodb optional
mysql>drop table handsets;
mysql>SELECT name FROM person_tbl WHERE name REGEXP '^st'; #stan
mysql>alter table handset drop col1;
mysql>alter table handset drop col1 int;
mysql>alter table handset modify col1 char(10) not null default 'some';
mysql>alter table handset rename to mobiles;
mysql>create unique index on handset(name,manufacturer) #combination must be unique
mysql>alter table handset add primary key(name);
mysql>alter table handset drop primary key;
mysql>alter table handset add index name_index(manufacturer);
mysql>alter table handset add unique index name_index(name); #duplicates are ok

#architecture------------------------------------------------------------------------------------------
'3 layers':
-------------
layer1: network connection, security, authentication
layer2: query parsing, functions, stored procedures, caching
		query is parsed into a tree structure and optimisations are executed, some affected by table storage engines.
		only 'select' queries are cached with resultsets.
layer3: storage engines, access via abstract apis, dont talk with each other but only with server.

'concurrency control':
-------------------------
lock strategies:
a 'write lock' blocks other writes and precedes 'read lock'
table lock=> 
	low overhead, low concurrency
	at table level (alter table...) 
	write lock on CUD on table, 
	many subtypes exists, 
	independent of storage engines
row lock=>
	high overhead, high concurrency
	implemented in storage engine not server level,
	available in innoDB/xtraDB

ACID:
-----*
transactions=> start <sqls> commit|rollback
Atomicity=> all or nothing
 	Consistency=> db moves from one consistent state to another
Isolation=> transactions effects visibility 
Durability=> once committed, its not lost.

ANSI SQL isolation levels
--------------------------
READ UNCOMMITTED=>read uncommitted data('dirty reads') from other transactions, rarely used
READ COMMITTED=>read only committed data from other transactions, but 'nonrepeatable reads' are still possible
				'nonrepeatable read': row content which is picked twice within this T1, altered by another committed T2.
				default in most databases
REPEATABLE READ=>read only committed data from other transactions, but 'phantom reads' are still possible, 
				'phantom read': row content picked twice by T1 not altered, but number of rows can be changed by T2
				default in mysql
SERIALIZABLE=>locks every row it reads.
---------------------------------------------------------------------------------------
Isolation level 	|Dirty reads	|Nonrepeatable reads |Phantom reads	|Locking reads
---------------------------------------------------------------------------------------
READ UNCOMMITTED 		Yes 			Yes 				Yes 			No
READ COMMITTED 			No 				Yes 				Yes 			No
REPEATABLE READ 		No 				No 					Yes 			No
SERIALIZABLE 			No 				No 					No 				Yes
---------------------------------------------------------------------------------------

'deadlocks': T1 and T2 can lock each other out.
T1: 
	begin; 
	update handset set name="a" where id=1;
	update handset set name="b" where id=2;
	end
T2: 
	begin; 
	update handset set name="b" where id=2;
	update handset set name="a" where id=1;
	end
InnoDB can detect circular dependencies and throw out errors.
transactions are controlled at storage engines level. 
If in a transaction, you mix non-transaction tables (myISAM) with transaction ones(innodb),rollback not possible in myISAM.
InnoDB supports 2 phase implicit locking in transactions
Explicit locking can be done using non-ansi sql 'select ..  lock in share mode' or 'lock tables'

'MVCC-Multiversion Concurrency Control:'
----------------------------------------
REPEATABLE READ, READ COMMITTED use this mechanism instead of row-level locking like SERIALIZABLE.
Its just like codebase management using versions and multiple coders.
Each transaction sees a snapshot of the database before it started.
Every row has hidden additional data 
	T1 id of the creator transaction (insert)
	T2 id of the expiry transaction (delete, update(a row expiry followed by a insert)) 
transaction ids T(1..N) are global numbers 
A transaction T(N) picks rows whose T1<N T2=0|N 
If conflict occurs during update, last transaction is rolled back.

'write-ahead-logging'
all operations are written in transaction logs then and applied later to disk for performance
all used for crash recovery


'storage engines:brief:'
#----------------------*----------------------*----------------------*----------------------*----------------------*----------------------*----------------------*
1|'innodb:':
short-lived transactions and crash recovery
building indexes by sorting, 
the ability to drop and add indexes without rebuilding the whole table, 
and a new storage format that offers compression,
a new way to store large values such as BLOB columns, and file format management.
by default since 5.5 , Facebook, Google and Oracle contributions
uses REPEATABLE READ with MVCC and a key-lock strategy to avoid phantom reads
clustered index: Primary Key lookup is very fast, but they tend to be associated with every other index created on the table. So PK column size should be small.

2|'myISAM':
no transactions, no crash recovery
locks entire tables, not rows. Readers obtain shared (read) locks on all tables they need to read. Writers obtain exclusive (write) locks
table is stored as files with .MYD(data) and .MYI(index) extensions
'CHECK TABLE mytable' and 'REPAIR TABLE mytable' to repair tables, but unreliable
create indexes on the first 500 characters of BLOB and TEXT columns in MyISAM tables. 
supports full-text indexes, which index individual words for complex search operations
'myisampack' to compress read-only tables, this is done at row-level. this saves diskIO time, uncompressing data while reading is more CPU work but still fast.

3|'archive':only insert and select. best suited for fast inserts as selects are table scans. no transactions, compressed storage
4|'blackhole':inserts are diverted from being written to a disk but to a 'log'.this can be used for fancy replication tools and auditing.
5|'csv':stores cvs files as tables, just move them to mysql data dirs even on a running server, but no indexes
6|'federated':  just a proxy to a remote server, executes sqls there and then returns results here.

7|'memory':
formerly called HEAP tables
are useful when you need fast access to data that either never changes or doesn’t need to persist after a restart. 
can be up to an order of magnitude faster than MyISAM tables. 
stored in memory, so queries don’t have to wait for disk I/O. 
table structure of a Memory table persists across a server restart, but no data survives.

8|'NDB'
MySQL AB acquired the NDB database from Sony Ericsson in 2003 and built the NDB Cluster storage engine as an interface between the SQL used in MySQL and the native
NDB protocol. The combination of the MySQL server, the NDB Cluster storage engine, and the distributed, shared-nothing, fault-tolerant, highly available NDB database is
known as 'MySQL Cluster'

9|'3rd party': 
xtraDB plugin from Percona, compatible with innodb files, more performant.
'rethinkDB': append only B tree
'tokuDb': marketed as a Big Data storage engine, because it has high compression ratios and can support lots of indexes on large data volumes

Conversions:
---------------
mysql> ALTER TABLE mytable ENGINE = InnoDB;	
use mysqldump for safety

#---------------------------------------------------------------------------------------------------------------------------------------------------------------
'Benchmarking:'
---------------*
sysbench=> tool for benchmarking
just general guidelines, nothing specific
'profiling:'
-----------*
measure of sql query occurrences with response times over a fixed observation period.
execution-time profing=>sqls that take more cpu time
wait-analysis=>sqls blocked waiting for other sqls
'show status' was the only instrumentation data before 5.1, now 'performance schema' is available.
better to profile from the server to db to get user patterns (jmeter)
'slow query log' to log al slow queries, but can log everything wwith response if threshold made zero.
'pt-query-digest' to profile sqls executed (only in Percona Server)


mysql> set profiling=1; #captures record of all sqls with response times
mysql> show profiles;  #show the results
+----------+------------+-------------------------------------------------+
| Query_ID 	| Duration 		| Query |
+----------+------------+-------------------------------------------------+
| 1 		| 0.16767900 	| SELECT * FROM sakila.nicer_but_slower_film_list |
+----------+------------+-------------------------------------------------+
mysql> show profile for query 1;
+----------------------+----------+
| Status 			| Duration |
+----------------------+----------+
| starting		 	| 0.000082 |
| Opening tables 	| 0.000459 |
| System lock 		| 0.000010 |
| Table....


mysql> SET @query_id = 1; #variable
Query OK, 0 rows affected (0.00 sec)
mysql> SELECT 
	STATE, 
	SUM(DURATION) AS Total_R, 
	ROUND(100 * SUM(DURATION) /(SELECT SUM(DURATION) FROM INFORMATION_SCHEMA.PROFILING WHERE QUERY_ID = @query_id), 2) AS Pct_R,
	COUNT(*) AS Calls,
	SUM(DURATION) / COUNT(*) AS "R/Call"
FROM INFORMATION_SCHEMA.PROFILING
WHERE QUERY_ID = @query_id
GROUP BY STATE
ORDER BY Total_R DESC;

mysql> show status; #show server level numbers
mysql> explain select * from handsets;

'performance schema' : 5.5+
mysql> SELECT event_name, count_star, sum_timer_wait FROM events_waits_summary_global_by_event_name ORDER BY sum_timer_wait DESC LIMIT 5;
+-------------------------------------------+---------------+-------------------------+
| event_name 								| count_star 	| sum_timer_wait 	|
+-------------------------------------------+---------------+-------------------------+
| innodb_log_file 							| 205438 		| 2552133070220355 	|
| Query_cache::COND_cache_status_changed 	| 8405302 		| 2259497326493034 	|
| Query_cache::structure_guard_mutex 		| 55769435 		| 361568224932147 	|
| innodb_data_file 							| 62423 		| 347302500600411 	|
| dict_table_stats 							| 15330162 		| 53005067680923 	|
+--------------------------------------------+--------------+-------------------------+
mysql>SHOW PROCESSLIST # lok for lots of threads that are in unusual states or have some other unusual characteristi

#---------------------------------------------------------------------------------------------------------------------------------------------------------------
'Schema optimisations:'
------------------------*

1|datatypes:
---------------
choose smallest possible type for your need (int, tinyint, char)
avoid null in indexed columns, extra space and cpu time in indexing
use'datetime, time' instead of string for dates.
use'VARCHAR'
	 when the maximum column length is much larger than the average length; 
	 when updates to the field are rare, so fragmentation is not a problem; a
	 when you’re using a complex character set such as UTF-8, where each character uses a variable number of bytes of storage.
use 'char' 
	when updates are more and width is less.
	'blob' types store binary data with no collation or character set, but 'text' types have a character set and collation.	 

use 'enum'
	saves space by mapping them into integers (1,2..), 
	but adding a new item is costly as 'alter table' is needed
	joining other char or varchar to enums in sqls can be costly
'join' only same data types or closely related types

2| Identifiers(PK,FK,join columns)
-----------------------------------*
'Integers' are usually the best choice for identifiers (pk, fk, join), because they’re fast and they work with AUTO_INCREMENT.
'enum/set' are bad
'string' are bad
	when used in myISAM,
	when randomly generated by MD5(), SHA(), UUID() bcos
		random seek in case of indexes during 'insert' and 'select'
		cache locality failure  

3|Design gotchas:
-----------------*
too many columns:=>	channels between servers and storage engines gets affected.
too many joins:=> 
enums:=> alter table required
set => disguised enums in some scenarios
null:=> extra space and cpu time in indexing

6|strategies
--------------*
selecting between de/normalisation them depends on your needs
'normalisation'=> 
	no duplicates, relations using PKs and FKs
	joins in sqls
'denormalisation'=> 
	duplicated and stored in many places
	no joins, all data in many columns
'cache/summary table' => 
	table filled with data at periodic intervals  
	like number of msgs from different countries in a forum for past 24 hrs, can be done every hour.
	stale data not an issue.
'materialized views'=> 
	unlike 'views' which just stores only the query and translates into into underlying form during runtime,
	this takes up storage space by duplicating and storing the values in a separate table. 
	It reads deltas directly from binary logs instead of going to the source tables.
'alter table'=>
	are very slow, they copy records to a new table and then drop.
	but some can be executed directly on the .frm file withouth touching the data.

#---------------------------------------------------------------------------------------------------------------------------------------------------------------
'Indexes:'
-----------*
1| 'B-tree Index'
B-tree=> a generalisation of the binary tree where a varying range of data blocks sit in each node, both intermediate and leaf.
B+tree=> A B-tree where each leaf points to the next

B-tree of order m (say 5)
	each node should have m/2 -m children (3-5)
	root can have 2 children
	the leaf nodes must be at the same level, so tree goes bottom-up.
	whenever a leaf node overflows m, its split into 2 leaves at the same level, pushing midpoint up into its parent.
	this grouped structure helps in reducing the disk seek time 

column order is important in index creation

2|'Hash Index' 
Participating columns contents are used to generate a hash which is stored as a B-tree
No partial or range queries only strict equality
innoDB does 'adaptive has indexing' for freqently accessed indexes, cannot be configured done by internal optimisations.
make sure hash function returns integer, distributes well, not many collisions. 
sha1(), md5() return big strings, so not ok
mysql> SELECT id FROM url WHERE url_crc=CRC32("http://www.mysql.com") AND url="http://www.mysql.com"; #literal value required for collision(like equals() and hash())

3|rest: full-text indexes, Spatial R index.

'strategies:'
-------------*
1| 	isolating the columns=> the 'where' column should contain expressions or functions
		mysql> SELECT actor_id FROM sakila.actor WHERE actor_id + 1 = 5; #bad
		mysql> SELECT ... WHERE TO_DAYS(CURRENT_DATE) - TO_DAYS(date_col) <= 10; #bad
2| 	wide text columns should use 'prefix', again research should be done on the right prefix length.
3| 	multi-column indexes better than having multiple single column indexes, depending on the sqls. mysql does index merging in case of multiple single column indexes.
4| 	in multi-column index, having the most selective(filters most) column as the left-most is a thumb rule but not always effective.(data distribution) 
5| 'clustered indexes'=> 
	storing the index and data files together (recall 'structured index in sql server')
	only one index per table as rows storage can be altered only once.
	only leaf nodes contain data rest contain the indexed column.
	performant, no pointer redirection from index.
6| 	'sequential keys' are much better than random uuid keys in case of storage in DB pages. The b-tree wont have much flux in sequential keys.
7| 'sorting':
	Ordering the results by the index works only when the index’s order is exactly the same as the ORDER BY clause and all columns are sorted in the same direction (ascending or
	descending).
	The ORDER BY clause also has the same limitation as lookup queries: it needs to form a leftmost prefix of the index. In all other cases, MySQL uses a sort.
	If the query joins multiple tables, it works only when all columns in the ORDER BY clause refer to the first table
8| myISAM prepack prefix indexes (like perform, performance stored as '7'ance). Not good for individual lookup, sorting.
9| 'redudant indexes' can be good at times or bad, 'unused indexes' are bad
10| 'covered index' has all columns needed in a query. No need to lookup the table again.

#---------------------------------------------------------------------------------------------------------------------------------------------------------------
'Query optimisations:'
---------------------*
'Slow query gotchas':
1| fetching too many rows => use 'limit'
2| fetching too many columns => select *
3| fetching all columns in a multi-join => select * from A join B using(some_id)
4| fetching same data repeatedly => use cache 

'metrics':
Response time 
	queue time(io+locks) + service time(process query)
	determine counts of random and sequential access and multiply by hardware time.
No of rows accessed
	not perfect, some rows are big, some are small
	ratio of rows examined/rows returned matters 
'restructure':
chopping a big query into small ones can help at times when you dont have to worry about network speed.

'execution steps'
1. The client sends the SQL statement to the server.
2. The server checks the query cache. If there’s a hit, it returns the stored result from the cache; otherwise, it passes the SQL statement to the next step.
3. The server parses, preprocesses, and optimizes the SQL into a query execution plan.
4. The query execution engine executes the plan by making calls to the storage engine API.
5. The server sends the result to the client. Each of these steps has some extra complexity,

'client-server connection:'
its a half-duplex, either request or response can happen at any point of time, not simultaneously.
server sends entire resultset always, no buffering anywhere in mysql (ur client library can), so client must wait
its best to use 'limit' based on needs to limit the traffic

'query-thread-states'
mysql>show full processlist #can help in viewing states

a) Sleep=>The thread is waiting for a new query from the client.
b) Query=>The thread is either executing the query or sending the result back to the client.
c) Locked=>
		The thread is waiting for a table lock to be granted at the server level. 
		Locks that are implemented by the storage engine, such as InnoDB’s row locks, do not cause the thread to enter the Locked state. 
		This thread state is the classic symptom of MyISAM locking, but it can occur in other storage engines that don’t have rowlevel locking, too.
d) Analyzing and statistics=>The thread is checking storage engine statistics and optimizing the query.
e) Copying to tmp table [on disk]=>
	The thread is processing the query and copying results to a temporary table, probably for a GROUP BY, for a filesort, or to satisfy a UNION. 
	If the state ends with “ondisk,” MySQL is converting an in-memory table to an on-disk table.
f) Sorting result=>The thread is sorting a result set.
g) Sending data=>This can mean several things: the thread might be sending data between stages of the query, generating the result set, or returning the result set to the client.

'query cache' stores hash of whole query, checks privileges first, then if found returns resultset.
'query parsing': makes a parse tree, check privileges
'query optimizing': 
works in the server, uses data from storage engines.
make a execution plan with analysing options and picking one with minimum cost
they might not be right always, though its a complex process.
 	cost of a query:		
		mysql> SELECT SQL_NO_CACHE COUNT(*) FROM sakila.film_actor;
		+----------+
		| count(*) |
		+----------+
		| 5462 |
		+----------+
		mysql> SHOW STATUS LIKE 'Last_query_cost';
		+-----------------+-------------+
		| Variable_name | Value |
		+-----------------+-------------+
		| Last_query_cost | 1040.599000 | #1040 random page reads
		+-----------------+-------------+

static optimizing => not dependent on predicate values or context, done once for a query
dynamic optimizing => done during runtime, depends on context

'optimizing strategies':
	reorder joins
	converting outer join to inner joins
	simplify predicate expressions
	subquery optimizing
	early termination-limit, impossible condition
	covering indexes.
	equality probagation=> columns on a join and a where clause will be probagated to both leading to faster filtering.
	in clause=> sorts the items in 'in'leading to O(log(n))

'joins'	
	mysql execution of joins is nested for every join (for i{..{for j..{for k..}}}
	results are put in a temp table
	mysql>explain extended select ... show warnings;
'order by'
	sorting can be done in-memory or in disk
	sorting can be 
		2-pass: older than 4.2
				1pass:row pointers + columns picked first,sorted
				2pass:sorted rowpointers are then used to scan table and pick real content

		1-pass: all data picked in one shot and sorted
				more space required.
'execution engine'
	simpler compared to the optimiser.
	receives a datastructure of instructions from optimisations and just executes them by calling Storage apis.

'query optimizing hints'
count(*) gives no of rows, while count(column1) gives no of non-null values in column1


#--------------------------------------------------------------------------------------------------------------------------------------------------------------
Advanced MySQL features:
------------------------*
1|'partitioning':
partitioned tables have multiple underlying tables, which are represented by Handler objects
implements partitioning—as a wrapper over hidden tables—means that indexes are defined per-partition, rather than being created over the entire table.
can be distributed physically, enabling the server to use multiple hard drives more efficiently.
back up and restore individual partitions

'partition by' clause decides the mechanism, for example,
here’s a simple way to place each year’s worth of sales into a separate partition:
mysql>	CREATE TABLE sales (order_date DATETIME NOT NULL,-- Other columns omitted) ENGINE=InnoDB 
		PARTITION BY RANGE(YEAR(order_date)) (
			PARTITION p_2010 VALUES LESS THAN (2010),
			PARTITION p_2011 VALUES LESS THAN (2011),
			PARTITION p_2012 VALUES LESS THAN (2012),
			PARTITION p_catchall VALUES LESS THAN MAXVALUE );
mysql> EXPLAIN PARTITIONS select ...; #good to have partition column as predicate, otherwise bad scanning all partitions

2|'merge tables':
older form of partitioning with some niche features.
works only in myISAM.

3|'views': 
mysql> CREATE VIEW Oceania AS SELECT * FROM Country WHERE Continent = 'Oceania' WITH CHECK OPTION;
mysql uses 
	'merge' algorithm when no aggregates in query, no temp table required, just merges view sql+query qsql
	'template' algorithm when aggregates used.
	mysql> explain select * from <view>
4| 'updatable views'
	A view is not updatable if it contains GROUP BY, UNION, an aggregate function, or any of a few other exceptions. 
	A query that changes data might contain a join, but the columns to be changed must all be in a single table. 
	Any view that uses the TEMPTABLE algorithmis not updatable.	
	'with check option' will let you not update using an view where it changes 'Continent'
5| mysql does not support 'materialized views' and 'indexable views'
6| 'foreign keys' - supported only innodb and best to index them for performance.
7| 'stored procedures' - 
	mysql development tools are limited
	not testable, avoid it
	optimizer cannot work on it
	caching works per connection, so repeated execution on separate connections cause similar creations of cache execution plans and caching them.

8| 'trigger'
	can obscure what your server is really doing
	can be hard to debug, and it’s often difficult to analyze performance bottlenecks
	can cause nonobvious deadlocks and lock waits. 
	can be part of transactions, but tables should be really part of the transaction (in innodb 'for update' in the trigger tables)

9| 'events'
	scheduled cron-like stored procedures triggered by a separate scheduled thread.
	good uses for events include periodic maintenance tasks,rebuilding cache and summary tables to emulate materialized views, or saving status values for monitoring and diagnostics
10|'cursors'
	more like a row pointer to iterate over in a set of rows fetched	
	used more in stored procedures
	mysql implementation of cursor is not great.

11| 'prepared statement'
	uses binary protocol for client-server communication
	parses a query once and saves it as a partial structure with placeholders for parameters.
	reduces the traffic, by sending only the parameters, not the entire query text needed for each execution
	
	mysql> SET @sql := 'SELECT actor_id, first_name, last_name FROM sakila.actor WHERE first_name = ?';
	mysql> PREPARE stmt_fetch_actor FROM @sql;
	mysql> SET @actor_name := 'Penelope';
	mysql> EXECUTE stmt_fetch_actor USING @actor_name;
	mysql> DEALLOCATE PREPARE stmt_fetch_actor;

12| 'user defined functions' - UDF
	can write UDFs in any programming language that supports C calling conventions
	must be compiled and then dynamically linked with the server, making them platform-specific and giving you a lot of power
	memcached uses this somewhere

13| 'character sets and collation'
	A character set is a mapping from binary encodings to a defined set of symbols; alphabet in bits
	they are inherited at every level (db, table, column)
	mysql> show character set
	mysql> show collation

14| 'full text indexing'
	A MyISAM full-text index is a special type of B-Tree index with two levels. 
	The first level holds keywords. Then, for each keyword, the second level holds a list of associated document pointers that point to full-text collections that contain that keyword.

15| 'XA transactions'
	transactions across different softwares
	'external'=> can act as a participant in XA transactions, but not as a coordinator.
	'internal'=> any cross-storage engine is a xa one controlled by the mysql server.
16| 'query cache'
	stores hash of sql+parameters with the complete resultset
	when a query cache hit occurs, the server can simply return the stored results immediately, skipping the parsing, optimization, and execution steps.
	keeps track of which tables a query uses, and if any of those tables changes, it invalidates the cache entry
	keeping the size small is very critical as it can become a concurrent threads bottleneck.
	can store only deterministic sqls (no CURRENT_DATE, CURRENT_USER)
	can be a performance bottleneck for both reads and writes(invalidation)
	everything is stored in memory
	the query cache hit rate is given by the formula 'Qcache_hits / (Qcache_hits+Com_select)'

	'some techniques':
	Having multiple smaller tables instead of one huge one can help
	It’s more efficient to batch writes than to do them singly, because this method invalidates cached cache entries only once
	server can stall for a long time while invalidating entries in or pruning a very large query cache
	cannot control the query cache on a per-database or per-table basis, but you can include or exclude individual queries
	disabling the query cache for a write-heavy app is good

#---------------------------------------------------------------------------------------------------------------------------------------------------------------
'Replication setup:'
--------------------*
1|two kinds:
	statement-based=>
		for every logical sql statement, 
		uses binary log, simple to implement, 
		does not work with non-deterministic sqls
		good when master-slave schema differ slightly
		best to avoid given the bugs
	row-based=>
		came after 5.1, 
		uses binary log, 
		uses more traffic, 
		better is most scenarios
		uses less cpu as no query parsing is done.


2|'master' must turn on binary logging, good overhead in all 'slaves' reading from it.
3| good for scaling reads not writes
4| benefits:
	data-distribution=>move data to another remote server.
	load-balancing=>distribute read queries across several servers,which works very well for read-intensive applications
	can help in backups, high availability and failover
	testing mysql upgrades 
5| high level steps:
	1. The master records changes to its data in its 'binary log'. (These records are called binary log events.)
	2. The replica copies the master’s binary log events to its 'relay log'.
	   The slave I/O thread opens an ordinary client connection to the master, then starts a special 'binlog' dump process
	3. The replica replays the events in the relay log, applying the changes to its own data.	

'simple setup steps'
Note:  Consider server1 as master and server2 as slave and replicating database as exampledb. 

'Server 1(Master)'
1) Configuring the Master
	To make sure that the replication can work, we must make MySQL listen on all interfaces on the master (server1), 
	therefore we comment out the line bind-address = 127.0.0.1 in '/etc/mysql/my.cnf':

	#bind-address           = 127.0.0.1

	We have to tell MySQL for which database it should write logs (these logs are used by the slave to see what has changed on the master), 
	which log file it should use, and we have to specify that this MySQL server is the master. We want to replicate the database exampledb

	server-id               = 1
	log_bin                 = /var/log/mysql/mysql-bin.log
	expire_logs_days        = 10
	max_binlog_size         = 100M
	binlog_do_db            = exampledb

2)  Restart MySQL server
3)  Set up a replication user slave_user that can be used by server2 to access the MySQL database on server1:
		mysql>  GRANT REPLICATION SLAVE ON *.* TO 'slave_user'@'%' IDENTIFIED BY 'slave_password';
		mysql>  FLUSH PRIVILEGES;
4)  Find out the master status of the server1 and create a SQL dump of the database.
        mysql>  USE exampledb;
        mysql>  FLUSH TABLES WITH READ LOCK;
        mysql>  SHOW MASTER STATUS;
    In another shell,
   		$> mysqldump -u root -pyourrootsqlpassword --opt exampledb > snapshot.sql
5)  Unlock tables
		mysql> UNLOCK TABLES; 

 'Server 2(Slave)'
1)  Configure slave  server by changing  'my.cnf' file
		server-id=2
        master-connect-retry=60
        replicate-do-db=exampledb
2)  Restart MySQL server
3)  Import the SQL dump 
        $> mysql -u root -pyourrootsqlpassword exampledb < snapshot.sq
4)  Give slave parameters
        mysql>  CHANGE MASTER TO MASTER_HOST='192.168.0.100',           
         		MASTER_USER='slave_user',   MASTER_PASSWORD='slave_password',          
        		MASTER_LOG_FILE='mysql-bin.000001',  MASTER_LOG_POS=19467;
5)  Start slave
        mysql>  START SLAVE;
6)  Check  slave status (It is important that both Slave_IO_Running and Slave_SQL_Running have the value Yes in the output. 
 	And also  Slave_IO_State should be Waiting for master to send event)
        mysql> SHOW SLAVE STATUS \G

7) mysql> SHOW PROCESSLIST\G on both master ans slave to confirm replication is up.

'files used:'
mysql-bin.index=>index of binary log files
mysql-relay-bin.index=>index of relay binary log files
master.info=>slave file containing details like user/password to access master 
relay-log.info=>current position of replica wrt master log file.

'strategies'
replicas can be filtered to receive certain events only (can be done either at master or slave end)
one master->many replicas linked to each other in serial fashion
one master->many slaves, but a slave can have only one master anytime
one master->one master | active mode - write and reads on both masters and synching back and forth. possible but rife with issues.
one master->one master | passive mode - write/read in one while only read in passive
one master with slaves->one master with slaves 
ring -> dont do it










































