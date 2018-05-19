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
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Controller
public class MessageController {

    private MessageRepository messageRepository;

    private SimpUserRegistry simpUserRegistry;

    public MessageController(MessageRepository messageRepository, SimpUserRegistry simpUserRegistry) {
        this.messageRepository = messageRepository;
        this.simpUserRegistry = simpUserRegistry;
    }

    /**
     * 查询最近聊天记录
     *
     * @param pageable 分页信息
     * @return
     */
    @GetMapping("/latest")
    @ResponseStatus(HttpStatus.OK)
    public @ResponseBody
    Page<Message> latestMessage(Pageable pageable) {
        return messageRepository.findLatestMessage(pageable);
    }

    /**
     * 获取目前所有登录用户
     *
     * @return
     */
    @GetMapping("/allUser")
    @ResponseStatus(HttpStatus.OK)
    private @ResponseBody
    List<String> getUsers() {
        return simpUserRegistry.getUsers().stream().map(SimpUser::getName).collect(Collectors.toList());
    }

    /**
     * 群聊信息处理
     *
     * @param message
     * @param principal
     * @return
     * @throws Exception
     */
    @MessageMapping("/all")
    @SendTo("/topic/all")
    public String sendToAll(String message, Principal principal) throws Exception {
        Message m = null;
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
            if (token.getPrincipal() instanceof NeuchatUserDetails) {
                NeuchatUserDetails userDetails = (NeuchatUserDetails) token.getPrincipal();
                m = messageRepository.save(new Message(userDetails, message));
            }
        } else {
            log.error("登录用户错误");
        }
        return principal.getName() + " ：" + message + " time : " + (m != null ? m.getCreateTime() : "");
    }

    /**
     * 连接事件处理
     *
     * @param message
     * @param principal
     * @return
     * @throws Exception
     */
    @MessageMapping("/connect")
    @SendTo("/topic/connect")
    public String connectEvent(String message, Principal principal) throws Exception {
        log.info("{} is connected", principal.getName());
        return principal.getName();
    }
}
