
1 STREAMS VS COLLECTIONS
//......................

Collections and streams, while bearing some superficial similarities, have different goals. 
Collections are primarily concerned with the efficient management of, and access to, their elements. 
By contrast, streams do not provide a means to directly access or manipulate their elements, and are instead concerned with declaratively describing the computational operations which will be performed in aggregate on that source. 
Accordingly, streams differ from collections in several ways:

'No storage'.
Streams dont have storage for values; they carry values from a source (which could be a data structure, a generating function, an I/O channel, etc) through a pipeline of computational steps.

'Functional in nature'. 
Operations on a stream produce a result, but do not modify its underlying data source.

'Laziness-seeking'. 
Many stream operations, such as filtering, mapping, sorting, or duplicate removal) can be implemented lazily. 
This facilitates efficient single-pass execution of entire pipelines, as well as facilitating efficient implementation of short-circuiting operations.

'Bounds optional'. 
There are many problems that are sensible to express as infinite streams, letting clients consume values until they are satisfied. 
(If we were enumerating perfect numbers, it is easy to express this as a filtering operation on the stream of all integers.) 
While a Collection is constrained to be finite, a stream is not. 
(To terminate in finite time, a stream pipeline with an infinite source can use short-circuiting operations; alternately, you can request an Iterator from a Stream and traverse it manually.)
