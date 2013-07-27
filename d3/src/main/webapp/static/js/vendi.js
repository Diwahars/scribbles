Diagram1 = function(){
  var svg = d3.select("#diagram-1").style("padding","30px");
  var postSeed;

  this.boot = function(){
      postSeed = new PostSeed().boot();
      drawPosts();
      drawTags();
      drawLabels();
      drawLinks();
  };

  var drawPosts = function(){

     svg.selectAll("circle").data(postSeed.allPosts()).enter().append("circle")
     .attr("cy",function(d){d.y = 30; return d.y;})
     .attr("cx",function(d,i){d.x = (i*40)+20; return d.x;})
     .attr("r",1)
     .attr("fill","white")
     .transition().duration(1000)
     .attr("r",function(d){return d.tagKeys.length*3})
     .attr("fill","grey").attr("stroke","black");
  };

  var drawTags = function(){
     svg.selectAll("rect").data(postSeed.allTags()).enter().append("rect")
     .attr("y",function(d){d.y = 300; return d.y;})
     .attr("x",function(d,i){d.x = (i*120)+20; return d.x;})
     .attr("width",30)
     .attr("height",1)
     .transition().duration(1000)
     .attr("height",function(d){return d.postKeys.length*3;})
     .attr("fill","lightblue").attr("stroke","black");
  };

  var drawLabels = function(){
     var labels = svg.selectAll("text");
     labels.data(postSeed.allPosts()).enter().append("text")
          .text(function(d){return d.name;})
          .attr("y",10)
          .attr("x",function(d,i){return (i*40)+20;});
     labels.data(postSeed.allTags()).enter().append("text")
          .text(function(d){return d.name;})
          .attr("y",310)
          .attr("x",function(d,i){return (i*120)+20;});
  };

  var drawLinks = function(){
      var lines = [];
      $.each(postSeed.allTags(),function(i, tag){
         var lineColor = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
         for(var i=0;i< tag.postKeys.length;i++){
            var post = tag.posts[tag.postKeys[i]];
            lines.push(new Line(tag.x, tag.y, post.x, post.y, lineColor));
         }
      });
      svg.selectAll("line").data(lines).enter().append("line")
      .style("stroke", function(d){return d.color;})
      .attr("x1",function(d){return d.x1;})
      .attr("y1",function(d){return d.y1;})
      .attr("x2",function(d){return d.x1;})
      .attr("y2",function(d){return d.y1;})
      .transition().delay(500).duration(500)
      .attr("x2",function(d){return d.x2;})
      .attr("y2",function(d){return d.y2;});
  };

  var Line = function(x1,y1,x2,y2,color){
       this.x1 = x1;
       this.y1 = y1;
       this.x2 = x2;
       this.y2 = y2;
       this.color = color;
  };

};


//--------------- SEED  ---------------------------
Post = function(name){
   this.name = name;
   this.tags = {};
   this.tagKeys = [];
   this.x;
   this.y;

   this.addTag = function(tag){
     this.name = name;
     this.tagKeys.push(tag.name);
     this.tags[tag.name] = tag;
     tag.addPost(this);
   };
};
//-------------------------
Tag = function(name){
   this.name = name;
   this.posts = {};
   this.postKeys = [];
   this.x;
   this.y;

   this.addPost = function(post){
     this.postKeys.push(post.name);
     this.posts[post.name] = post;
   };

   this.hasPost = function(post){
     return posts[post.name] != null;
   };
};
//-------------------------
TagSeed = function(){
   var tags = new Array(8);

   this.random = function(){
     var randomSize = Math.floor((Math.random()*4)+3); //[3-7]tags/post
     var randomTags = new Array(randomSize);
     for(var i=0; i<randomSize; i++){
          var index = Math.floor(Math.random()*tags.length);
          randomTags[i] = tags[index];
     }
     return randomTags;
   };

   this.boot = function(){
     for(var i=0; i<tags.length; i++){
        tags[i] = new Tag("t_"+i);
     }
     return this;
   };

   this.allTags = function(){return tags};
};
//-------------------------
PostSeed = function(){
   var posts = new Array(25);
   var tagSeed = new TagSeed().boot();

   this.boot = function(){
     for(var i=0; i < posts.length; i++) {
        posts[i] = new Post("p_"+i);
        var tags = tagSeed.random();
        for(var j=0; j<tags.length; j++){
            posts[i].addTag(tags[j]);
        }
     }
     return this;
   };

   this.allPosts = function(){return posts};
   this.allTags = function(){return tagSeed.allTags()};
};
//-----------------------------------------------------
$(document).ready(function(){new Diagram1().boot()});