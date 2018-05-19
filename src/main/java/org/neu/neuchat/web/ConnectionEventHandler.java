package org.neu.neuchat.web;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * 连接事件处理
 */
@Slf4j
@Component
public class ConnectionEventHandler {
    private SimpMessagingTemplate template;

    public ConnectionEventHandler(SimpMessagingTemplate template) {
        this.template = template;
    }

    /**
     * 断开连接事件处理
     * @param event
     */
    @EventListener
    public void disconnect(SessionDisconnectEvent event) {
        log.info("{} is disconnected", event.getUser().getName());
        template.convertAndSend("/topic/disconnect", event.getUser().getName());
    }
}
