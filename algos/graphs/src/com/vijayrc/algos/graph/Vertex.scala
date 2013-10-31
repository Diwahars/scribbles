package com.vijayrc.algos.graph

import java.util.UUID

class Vertex(val key:UUID,val value:Any) {
  override def toString: String = key+"-"+value

  override def equals(obj: scala.Any): Boolean = {
    this.key.equals(obj.asInstanceOf[Vertex].key)
  }
}
