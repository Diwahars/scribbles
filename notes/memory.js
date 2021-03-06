----------------------------------------------*
What every programmer should know abt Memory?
----------------------------------------------*

Most chipsets follow this design: 
1: Chipset|
-----------
'Northbridge'=> CPUs and RAM connect to this bus. All CPUs connect to Northbridge via 'FSB (Front Side Bus)'
			  	CPUs talk between each other using this.
			  	RAM sometimes connect via memory controllers, this depends on RAM technology.
			  	'NUMA'(non uniform memory access): there is no Northbridge, just captive RAMs to each processor. 
			  	But there is a cost in accessing RAM belonging to a peer CPU.

'Southbridge'=> All devices like PCI, SATA, USB connect to this.
			  	CPU will talk with these devices all the way through North and South bridges
			  	'DMA' (direct memory access): These devices need not go through the CPU to access RAM and can directly access via Northbridge, 
			  	so now contention for RAM between them and CPU 	
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
2: RAMs|
--------*
'Static SRAM'=> 
cells based on transistors, 
fast in saying 0 or 1, 
rectangular signal, 
no refresh cycles needed.
high manufacture cost, specialised use only
used in cpu caches

'Dynamic DRAM'=>
cells based on capacitor, 
slow being dependent on capacitor discharge, 
not a rectangular signal so need processors to decipher 0/1, 
need refresh cycles
low cost, low space, prevalent use.
cells are accessed using RAS(Row address selection) and CAS(Column address selection) multiplexers and de-multiplexers
many types exists, Asynchronous DRAM, Rambus DRAM (obsolete, not widely used), Synchronous DRAM (SDRAM), Double Data Rate DRAM(DDR)

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
3:'Types of DRAM':
----------------*
'SDRAM'=>
Synchronous dynamic random access memory (SDRAM) is DRAM that is synchronized with the system bus. 
Classic DRAM has an asynchronous interface, which means that it responds as quickly as possible to changes in control inputs. 
SDRAM has a synchronous interface, meaning that it waits for a clock signal before responding to control inputs and is therefore synchronized with the computer system bus. 
The clock is used to drive an internal finite state machine that pipelines incoming commands. 
The data storage area is divided into several banks, allowing the chip to work on several memory access commands at a time, interleaved among the separate banks. 
This allows higher data access rates than an asynchronous DRAM.

	'SDRAM'=> 
		Single Data Rate SDRAM, 1 word read/write per cycle
		The SDR DRAMs were known simply by their frequency (e.g., PC100 for 100MHz SDR) 100MHz * 64bit * 1 = 800MB/s
	'DDR1' => 
		Double Data Rate SDRAM, 2 words read/write per cycle
	 	Increasing the frequency of RAM is power-expensive. DDR1 chip transports data on the rising and falling edge(â€œdouble-pumpedâ€ bus). 
	 	To make this possible without increasing the frequency of the cell array, a 'I/O-buffer' that holds '2' bits per data line is introduced.
	 	DDR module (they have 64-bit busses) can sustain:100MHz * 64bit * 2 = 1600MB/s [PC1600]
	'DDR2' => Double Data Rate SDRAM, 4 words read/write per cycle
		'I/O buffer' gets '4' bits in each clock cycle which it then can send on the bus.
	'DDR3' => Double Data Rate SDRAM, 8 words read/write per cycle
		The cell array of DDR3 modules will run at a quarter of the speed of the external bus which requires an '8' bit I/O buffer, up from 4 bits for DDR2
		less power consumption
		more latency than DDR2, should be used for high frequencies not met by DDR2.
	'DDR4' => Double Data Rate SDRAM, 8 words read/write per cycle, some interleaved data banks.


'DRAM Access'=>
First RAS signal, then CAS signal is sent on the address line
2-3-2-8-T1. This means:
	w 2 CAS Latency (CL) - delay between CAS and Data availability is CAS Latency |2-2.5 clock cycles.
	x 3 RAS-to-CAS delay (tRCD) - First RAS signal, then CAS signal is sent on the address line
	y 2 RAS Precharge (tRP) - cycles between precharge command and the row selection
	z 8 Active to Precharge delay (tRAS) - time taken to switch one row to other (RAS switch)
	T T1 Command Rate
BIOS settings can help tweak these latency timings. high performance servers do it, literature available.

'DRAM- Refresh'=>
Each DRAM cell must be refreshed every 64ms. Refresh cycles can stall data flows.
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
4: CPU Caches:
---------------*
RAM as fast as current CPU cores is orders of magnitude more expensive than any dynamic RAM.
In general, little better accessible RAMs are better than more far RAMs
Code and Data have spatial and temporal locality
Intel has separate code and data caches since 1993.
data caches stored decoded instructions
Data prefetch happening in parallel with processes is the key
3 levels of cache exists in modern machines

'Processor' has 'Cores', which in turn can have dedicated L1 caches but share L2, L3 caches between them.
each cache entry is tagged using the address of the data word in the main memory
memory is also need to store these address keys(tags)
entries in cache are not words but lines of 64 bytes

'Exclusive Cache'=>  
An 'delete' in L1 means subsequent 'add/push down' in L2, which in turn 'add/push down' L3 with 'delete' of last entry from L3. so more time required.
An 'add' in L1 is faster.
Used by AMD and VIA processors

'Inclusive Cache'=>
Duplicate entries everywhere, An entry in L1, is duplicated in L2 and L3
A 'delete' is fast from L1, but retained in L2/L3
Used by Intel.

'dirty entry'=>
A cache line which has been written to and which has not been written back to main memory is said to be dirty. 
Once it is written the dirty flag is cleared.

'Cache Coherency'=>
Symmetric Multi Processors should have the same consistent view of the main memory. 
So any dirty read pending in a peer processor must also be known.
Providing direct access to the caches of one processor from another processor is expensive. 
Instead, processors detect when another processor wants to read or write to a certain cache line.
If a 'write' access is detected and the processor has a clean copy of the cache line in its cache, it is marked invalid
In case of 'read', multiple clean copies of cache lines are present in all cpu caches.
In case of 'dirty read', one processor can read from a peer processor, and simultaneously push it to main memory.

'Cache Miss'=>
Register ≤1 cycles
L1d ∼ 3 cycles
L2 ∼ 14 cycles
Main Memory ∼ 240 cycles

-------------------------------------------
'Cache Associativity':

'Cache line'=> 
In practice an address, value is split into three parts. 

With a cache line size (say 32 bits) of [2 power 'O']('O'=5) the low 'O' bits are used as the 'offset' into the cache line. 
The next 'S' bits select the 'cache set'. There are 2 power 'S' sets of cache lines. 
This leaves the top '32−S−O = T'

'fully associative' =>
No 'S'. To access a cache line the processor core would have to compare the tags of every cache line with the tag for the requested address. 
The tag would be comprised of the entire part of the address which is not the 'offset' into the cache line.
Would not scala for large sizes - best of utmost 12 entries max.














