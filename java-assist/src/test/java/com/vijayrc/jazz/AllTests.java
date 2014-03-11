package com.vijayrc.jazz;

import javassist.*;
import org.junit.Test;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import static com.vijayrc.jazz.Log.print;

public class AllTests {
    @Test
    public void shouldAddInheritance() throws IOException, CannotCompileException, NotFoundException, IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        ClassPool pool = ClassPool.getDefault();
        CtClass circleClass = pool.get("com.vijayrc.jazz.Circle");
        circleClass.setSuperclass(pool.get("com.vijayrc.jazz.Shape"));

        CtMethod areaMethod = circleClass.getDeclaredMethod("area");
        areaMethod.insertAfter("System.out.println(\"calculated area..\");");
        circleClass.writeFile();

        Circle c = (Circle) circleClass.toClass().newInstance();
        c.setRadius(10);
        print("area of circle=" + c.area());

        Method getName = c.getClass().getMethod("getName");
        print(getName.invoke(c));
    }
    @Test
    public void shouldCreateANewClass() throws NotFoundException, CannotCompileException, IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        ClassPool pool = ClassPool.getDefault();
        CtClass squareClass = pool.makeClass("com.vijayrc.Square");
        CtClass doubleClass = pool.get("java.lang.Double");

        CtField sideField = new CtField(doubleClass,"side",squareClass);
        squareClass.addField(sideField);

        CtConstructor constr = new CtConstructor(new CtClass[]{doubleClass},squareClass);
        constr.setBody("this.side=$1;");
        squareClass.addConstructor(constr);

        CtMethod areaMethod  = new CtMethod(doubleClass,"area",null,squareClass);
        areaMethod.setBody("return new Double(Math.pow(this.side.doubleValue(),2d));");
        squareClass.addMethod(areaMethod);

        Constructor<?> constructor = squareClass.toClass().getConstructor(Double.class);
        Object square = constructor.newInstance(2d);
        Method area = square.getClass().getMethod("area");
        print(area.invoke(square));

    }

}
