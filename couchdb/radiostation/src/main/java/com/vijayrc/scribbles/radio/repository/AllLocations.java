package com.vijayrc.scribbles.radio.repository;

import com.vijayrc.scribbles.radio.data.DataSetup;
import com.vijayrc.scribbles.radio.documents.Location;
import org.ektorp.ComplexKey;
import org.ektorp.CouchDbConnector;
import org.ektorp.ViewQuery;
import org.ektorp.support.View;
import org.ektorp.support.Views;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Scope("singleton")
@Views({
        @View(name = "find_by_country_state_city",
              map = "function(doc){if(doc.type === 'Location'){emit([doc.country, doc.state, doc.city]);}}"),
        @View(name = "count_by_country_state_city",
              map = "function(doc){if(doc.type === 'Location'){emit([doc.country, doc.state, doc.city],1);}}",
              reduce="function(key, values){return sum(values);}")
})
public class AllLocations extends BaseRepo<Location> {
    @Autowired
    protected AllLocations(CouchDbConnector db) {
        super(Location.class, db);
    }

    @DataSetup(order = 1, description = "locations setup", key="Location")
    public void addData() {
        int countries = 3;
        int states = 5;
        int cities = 7;

        for (int i = 1; i <= countries; i++)
            for (int j = 1; j <= states; j++)
                for (int k = 1; k <= cities; k++)
                    add(new Location("city_" + k, "state_" + j, "country_" + i));
    }

    public Location findByCountryStateAndCity(String country, String state, String city) {
        ComplexKey key = ComplexKey.of(country.toLowerCase(), state.toLowerCase(), city.toLowerCase());
        return singleResult(queryView("find_by_country_state_city", key));
    }

    public int countByCountry(){
        ViewQuery count_by_country= createQuery("count_by_country_state_city").includeDocs(false).group(true).groupLevel(1);
        return db.queryView(count_by_country).getRows().size();
    }

}