package com.vijayrc.function

import org.scalatest.FunSuite

class FunctionerTest extends FunSuite{
  val functioner = new Functioner

  test("curse someone"){
    val curse: String = functioner.local("stupid")
    assert(curse == "Hey stupid fucker")
  }

  test("call function literal"){
    val list: List[Int] = List(1, 2, 3, 4, 5, 6, 7)
    val filtered: List[Int] = functioner.objects(list)
    filtered.foreach(x => print(x+","))
    assert(28==functioner.closure(list))
  }




}