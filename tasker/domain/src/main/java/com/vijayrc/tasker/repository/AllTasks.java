package com.vijayrc.tasker.repository;

import com.vijayrc.tasker.domain.Task;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
@Scope("singleton")
public class AllTasks {
    private static Logger log = LogManager.getLogger(AllTasks.class);
    private JdbcTemplate template;

    @Autowired
    public AllTasks(DataSource dataSource) {
        this.template = new JdbcTemplate(dataSource);
    }
    public List<Task> getForCard(String card){
        List<Task> tasks = template.query("select * from tasks where card = ?", new Object[]{card}, new TaskMapper());
        tasks.forEach(log::info);
        return tasks;
    }
    public Task getForCardAndId(String card, String id) {
        List<Task> tasks = template.query("select * from tasks where id = ? and card = ?", new Object[]{id,card}, new TaskMapper());
        tasks.forEach(log::info);
        return tasks.get(0);
    }

    private static class TaskMapper implements RowMapper<Task>{
        @Override
        public Task mapRow(ResultSet rs, int rowNum) throws SQLException {
            return Task.create(rs.getInt("card"),rs.getString("description"),rs.getString("status"));
        }
    }
}
