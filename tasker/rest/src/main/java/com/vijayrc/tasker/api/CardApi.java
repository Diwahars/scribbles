package com.vijayrc.tasker.api;

import com.vijayrc.tasker.param.CardParam;
import com.vijayrc.tasker.service.CardService;
import com.vijayrc.tasker.view.CardView;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Component
@Path("tasks")
public class CardApi {
    private static Logger log = LogManager.getLogger(CardApi.class);

    @Autowired
    private CardService service;

    @GET
    @Path("explain")
    @Produces("text/plain")
    public String explain(){
        return "resource to track all my tasks";
    }
    @GET
    @Produces({"application/xml", "application/json"})
    public List<CardView> all(){
        return service.getAll();
    }
    @GET
    @Path("/{id}")
    @Produces({"application/xml", "application/json"})
    public CardView get(@PathParam("id") String id){
       return service.getFor(id);
    }
    @GET
    @Path("/filter/{field}")
    @Produces({"application/xml", "application/json"})
    public Response filter(@BeanParam CardParam cardParam){
        log.info(cardParam);
        return Response.ok(service.getFor("1")).build();
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_XML)
    public void delete(@PathParam("id") String id){
        service.remove(id);
    }

}
