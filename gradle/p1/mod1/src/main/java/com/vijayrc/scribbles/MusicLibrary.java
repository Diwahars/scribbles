package com.vijayrc.scribbles;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import static ch.lambdaj.Lambda.extract;
import static ch.lambdaj.Lambda.on;
import static java.util.Arrays.asList;

@Service
public class MusicLibrary {

    private List<BaseMusic> musicList;

    @Autowired
    public MusicLibrary(HipHopMusic hipHopMusic, JazzMusic jazzMusic) {
        musicList = asList(hipHopMusic, jazzMusic);
    }

    public String play(String name) {
        for (Music music : musicList)
            if (music.is(name)) return music.play();
        return "";
    }

    public List<String> playlist() {
        return extract(musicList, on(BaseMusic.class).name());
    }
}
