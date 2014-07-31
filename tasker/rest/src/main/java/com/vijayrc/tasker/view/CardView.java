package com.vijayrc.tasker.view;

import com.vijayrc.meta.ToString;
import com.vijayrc.tasker.domain.Card;
import com.wordnik.swagger.annotations.ApiModel;
import com.wordnik.swagger.annotations.ApiModelProperty;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.Date;

@XmlRootElement
@ToString
@ApiModel(value = "card is logical grouping of tasks done by a group of users")
public class CardView {
    @ApiModelProperty( value = "card unique id", required = true )
    private String id;
    @ApiModelProperty( value = "title of the card", required = true )
    private String title;
    @ApiModelProperty( value = "summary of the card", required = true )
    private String summary;
    @ApiModelProperty( value = "card start date")
    private Date startBy;
    @ApiModelProperty( value = "card end date")
    private Date endBy;

    public static CardView map(Card card){
        CardView cardView = new CardView();
        if(card != null){
            cardView.id = card.id();
            cardView.title = card.title();
            cardView.summary = card.summary();
            cardView.startBy = card.startBy();
            cardView.endBy = card.endBy();
        }
        return cardView;
    }
    public Card toCard() {
        return new Card(id,title,summary,startBy,endBy);
    }
    public CardView id(String id) {
        this.id = id;
        return this;
    }
    public CardView title(String title) {
        this.title = title;
        return this;
    }
    public CardView summary(String summary) {
        this.summary = summary;
        return this;
    }
    public CardView startBy(Date startBy) {
        this.startBy = startBy;
        return this;
    }
    public CardView endBy(Date endBy) {
        this.endBy = endBy;
        return this;
    }

    /** TODO remove the getters/setters added only for tests to work as intellij does not see 'enhance'
     */
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getSummary() {
        return summary;
    }
    public void setSummary(String summary) {
        this.summary = summary;
    }
    public Date getStartBy() {
        return startBy;
    }
    public void setStartBy(Date startBy) {
        this.startBy = startBy;
    }
    public Date getEndBy() {
        return endBy;
    }
    public void setEndBy(Date endBy) {
        this.endBy = endBy;
    }
}
