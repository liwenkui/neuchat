package org.neu.neuchat.web;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class MessageController {

    @MessageMapping("/all")
    @SendTo("/topic/all")
    public String sendToAll(String message, Principal principal) throws Exception {
        return principal.getName() + " ：" + message;
    }
}
