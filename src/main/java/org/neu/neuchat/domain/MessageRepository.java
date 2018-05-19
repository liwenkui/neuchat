package org.neu.neuchat.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message,Long> {

    @Query("select m from Message m order by m.createTime")
    Page<Message> findLatestMessage(Pageable pageable);
}
