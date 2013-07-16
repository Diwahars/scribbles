package com.vijayrc.scribbles.radio.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.log4j.Log4j;
import org.codehaus.jackson.annotate.JsonProperty;
import org.ektorp.support.TypeDiscriminator;

@Log4j
@Getter
@NoArgsConstructor
@TypeDiscriminator("doc.type === 'Song'")
public class Song extends Doc {
    @JsonProperty
    private String name;
    @JsonProperty
    private Album album;
    @JsonProperty
    private String genre;
    @JsonProperty
    private Integer duration;
    @JsonProperty
    private String uniqueId;

    public Song(String title, Album album, String genre, Integer duration) {
        this.name = title;
        this.album = album;
        this.genre = genre;
        this.duration = duration;
        this.uniqueId = title+"|"+album;
    }

    @Override
    public String toString() {
      return uniqueId;
    }
}
