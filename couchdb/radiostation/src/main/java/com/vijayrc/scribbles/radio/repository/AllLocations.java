package com.vijayrc.scribbles.radio.repository;

import com.vijayrc.scribbles.radio.data.DataSetup;
import com.vijayrc.scribbles.radio.documents.Location;
import org.ektorp.CouchDbConnector;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Repository;

@Repository
@Scope("singleton")
public class AllLocations extends BaseRepo<Location> {

    @Autowired
    protected AllLocations(CouchDbConnector db) {
        super(Location.class, db);
    }

    @DataSetup(order = 1, description = "locations setup")
    public void addData() {
        int countries = 1;
        int states = 5;
        int cities = 7;

        for (int i = 1; i <= countries; i++)
            for (int j = 1; j <= states; j++)
                for (int k = 1; k <= cities; k++)
                    add(new Location("city_" + k, "state_" + j, "country_" + i));
    }
}
