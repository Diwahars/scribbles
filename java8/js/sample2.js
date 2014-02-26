var concurrent = new JavaImporter(java.util, java.util.concurrent);
var Callable = Java.type("java.util.concurrent.Callable");
with (concurrent) {
 	var tasks = new LinkedHashSet();
 	for (var i=0; i < 20; i++) {
        var task = Java.extend(Callable, {call: function() {print("task " + i)}})
        tasks.add(task);
        task.call();
    }
}