//---------------if and while
val x = 21  
if (x  > 0){	
	var i = 0
	while ( i < x ) {
   		print( i + ",")
   		i += 1
	}
}else{
  	println("try again with a number entry")
}
println("");
//----------------loop
args.foreach(arg=>print(arg+"--"))
println("")
args.foreach((arg: String) => print(arg+"--"))
println("")
args.foreach(print)
println("")
for(arg <- args) //note that arg is a val
	print(arg+"--")
println("")

//-----------------arrays
val curses = new Array[String](3)
curses(0)= "stan"
curses(1)="kyle"
curses(2)="cartman"
for ( i <- 0 to 2) print(curses( i )+" ")

val greets = Array("hi", "ciao")
greets.foreach(greet => print(greet+",--"))

//-----------------lists
val list1 = List("A","B","C")
val list2 = List("D","E")
val list3 = list1 ::: list2 
val list4 = "Z" :: list1
list3.foreach(print)
println("")
list4.foreach(print)

val list5 = 1::2::3::Nil
println(list5(2))

list3.drop(2).foreach(print)
println("")
list3.dropRight(2).foreach(print)
println("")
println(list1.exists(a=>a  == "B"))
list5.filter(a=>a > 2).foreach(print)
println("")
println(list3.forall(a=>a.endsWith("S")))
println("")
list3.map(a=>a+"1").foreach(print)
println("")
list3.remove(a=>a == "A").foreach(print)
println("")

//------------------tuples
val tuple = (99, "heha")
println(tuple._1+", "+ tuple._2.toUpperCase())

//-----------------sets and maps
//immutable set
var set1 = Set("spitfire", "b52") //HashSet ("spitfire", "b52") incase there is a need to avoid default scala implementation
set1 += "cessna"
set1.foreach(print)
println("")

//mutable set
var set2 = scala.collection.mutable.Set("bike","car")
set2.foreach(print)
println("")

//immutable map
var map1 = Map[Int, String]()
map1 += (1 -> "a1") // invoking method -> on (1) which returns tuple ( 1, "a1") , then method on map (map1).+=(1,"a1")
map1 += (2-> "a2") // -> method is available on any object.
map1 += (3-> "a3")
println(map1(2))

val romanNumeral = Map(1 -> "I", 2 -> "II", 3 -> "III", 4 -> "IV", 5 -> "V")
println(romanNumeral(4))

//---------assert
def 	link(args: Array[String]): String = args.mkString("--")
assert(  link(Array("A","B")) == "A--B" )

def addplus(x:String) = x+"--"
val chars = List("A","B","C")
chars.map(a=> addplus(a)).foreach(print)










