package com.vijayrc.enhancer;

import com.vijayrc.meta.Bean;
import javassist.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.reflections.Reflections;

import java.lang.reflect.Field;

import static org.apache.commons.lang.StringUtils.capitalize;
import static org.apache.commons.lang.StringUtils.contains;

public class BeanEnhancer implements Enhancer{
    private static Logger log = LogManager.getLogger(BeanEnhancer.class);

    public void run(String packageName) throws Exception {
        ClassPool pool = ClassPool.getDefault();
        Reflections reflections = new Reflections(packageName);
        for (Class<?> aClass : reflections.getTypesAnnotatedWith(Bean.class)) {
            CtClass ctClass = pool.get(aClass.getName());

            //~embed getter/setter
            for (Field field : aClass.getDeclaredFields()) {
                String fieldName = field.getName();
                CtClass fieldType = pool.get(field.getGenericType().getTypeName());
                getter(ctClass, fieldName, fieldType);
                setter(ctClass, fieldName, fieldType);
                log.info("done getter|setter:"+fieldName);
            }

            //~embed default constructor
            boolean hasNoArgsConstructor = false;
            for (CtConstructor constructor : ctClass.getConstructors())
                if(constructor.getParameterTypes().length == 0) {
                    hasNoArgsConstructor = true;
                    log.info("no args constructor already present");
                    break;
                }
            if(!hasNoArgsConstructor)
                ctClass.addConstructor(new CtConstructor(new CtClass[]{},ctClass));

            //~update class file
            ctClass.writeFile(aClass.getResource("/").getFile());
        }
    }
    private void setter(CtClass ctClass, String fieldName, CtClass fieldType) throws CannotCompileException {
        CtMethod setter  = new CtMethod(CtClass.voidType, "set"+ capitalize(fieldName), new CtClass[]{fieldType}, ctClass);
        setter.setBody("this." + fieldName + " = $1;");
        ctClass.addMethod(setter);
    }
    private void getter(CtClass ctClass, String fieldName, CtClass fieldType) throws CannotCompileException {
        CtMethod getter  = new CtMethod(fieldType,"get"+ capitalize(fieldName), null, ctClass);
        getter.setBody("return " + fieldName + ";");
        ctClass.addMethod(getter);
    }
}