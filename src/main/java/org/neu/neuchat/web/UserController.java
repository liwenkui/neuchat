package org.neu.neuchat.web;

import org.neu.neuchat.security.NeuchatUserDetails;
import org.neu.neuchat.security.User;
import org.neu.neuchat.security.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * 用户端点
 */
@RestController
@RequestMapping("/user")
public class UserController {

    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 用户信息端点
     *
     * @param user 用户信息
     * @return
     */
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public UserDetails user(@AuthenticationPrincipal NeuchatUserDetails user) {
        return user;
    }

    /**
     * 创建新用户
     *
     * @param dto 用户信息
     * @return
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User createUser(@RequestBody UserDTO dto) {
        User user = new User(null,dto.getUsername(), dto.getEmail(), passwordEncoder.encode(dto.getPassword()),
                true, true, true, true);
        return userRepository.save(user);
    }

}
