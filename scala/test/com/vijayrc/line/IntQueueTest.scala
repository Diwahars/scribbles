package com.vijayrc.line

import org.scalatest.FunSuite

class IntQueueTest extends FunSuite{

  test("stackable traits"){
    val intQueue = new IntQueue
    intQueue.put(2)
    intQueue.put(3)
    assert(2 == intQueue.get())

    val intQueueWithDoubler = new IntQueue with Doubler
    intQueueWithDoubler.put(4)
    assert(8==intQueueWithDoubler.get())

    val myDoublerQueue = new MyDoublerQueue
    myDoublerQueue.put(10)
    assert(20 == myDoublerQueue.get())
  }

}
