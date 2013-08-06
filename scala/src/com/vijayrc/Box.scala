package com.vijayrc

class Box {
    private var items:Set[Item] = Set()

    def add(item:Item):Unit = {
      items += item
    }

    def print():Unit = {
      println("Box:---")
      items.foreach(item => item.print())
    }
}
