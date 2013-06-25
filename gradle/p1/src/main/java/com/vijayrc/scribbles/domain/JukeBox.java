package com.vijayrc.scribbles.domain;

import com.vijayrc.scribbles.MusicLibrary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JukeBox {

    private MusicLibrary musicLibrary;

    @Autowired
    public JukeBox(MusicLibrary musicLibrary) {
        this.musicLibrary = musicLibrary;
    }

    public String play(String name) {
        return musicLibrary.play(name);
    }


    public list<String> all() {
        return musicLibrary.all();
    }
}
