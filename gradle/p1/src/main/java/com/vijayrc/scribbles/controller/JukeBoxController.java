package com.vijayrc.scribbles.controller;

import com.vijayrc.scribbles.domain.JukeBox;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class JukeBoxController {

    @Autowired
    private JukeBox jukeBox;

    @RequestMapping("/")
    public ModelAndView showBox(){
        return new ModelAndView("box").addObject("playlist", jukeBox.playlist());
    }


}
