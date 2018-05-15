package org.neu.neuchat.security;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

    /**
     * 使用用户名查找用户信息
     *
     * @param name 用户名
     * @return
     */
    Optional<User> findByName(String name);
}
