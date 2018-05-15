package org.neu.neuchat.web;

import org.neu.neuchat.security.NeuchatUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * 用户端点
 */
@RestController
@RequestMapping("/user")
public class UserController {

    /**
     * 用户信息端点
     * @param user 用户信息
     * @return
     */
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public UserDetails user(@AuthenticationPrincipal NeuchatUserDetails user) {
        return user;
    }

}
