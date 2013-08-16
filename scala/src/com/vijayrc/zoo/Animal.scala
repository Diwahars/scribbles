package com.vijayrc.zoo

abstract class Animal {
  val tail:Boolean
  var predator:Animal

  def sound:String
  def isScary:Boolean = sound.contains("growl")
  def hasTail:Boolean = tail
  def canEat(prey:Animal):Boolean = this == prey.predator
}
