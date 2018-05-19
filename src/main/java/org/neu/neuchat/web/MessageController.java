package org.neu.neuchat.web;

import lombok.extern.slf4j.Slf4j;
import org.neu.neuchat.domain.Message;
import org.neu.neuchat.domain.MessageRepository;
import org.neu.neuchat.security.NeuchatUserDetails;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.security.Principal;
import java.util.List;

@Slf4j
@Controller
public class MessageController {

    private MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping("/latest")
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody
    Page<Message> latestMessage(Pageable pageable) {
        return messageRepository.findLatestMessage(pageable);
    }

    @MessageMapping("/all")
    @SendTo("/topic/all")
    public String sendToAll(String message, Principal principal) throws Exception {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
            if (token.getPrincipal() instanceof NeuchatUserDetails) {
                NeuchatUserDetails userDetails = (NeuchatUserDetails) token.getPrincipal();
                messageRepository.save(new Message(userDetails, message));
            }
        } else {
            log.error("登录用户错误");
        }
        return principal.getName() + " ：" + message;
    }

    @MessageMapping("/connect")
    @SendTo("/topic/connect")
    public String connectEvent(String message, Principal principal) throws Exception {
        log.info("{} is connected", principal.getName());
        return principal.getName();
    }

}
