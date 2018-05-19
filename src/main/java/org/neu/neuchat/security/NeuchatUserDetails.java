package org.neu.neuchat.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class NeuchatUserDetails extends User implements UserDetails {

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (super.getName().equals("admin")) {
            return AuthorityUtils.commaSeparatedStringToAuthorityList("ROLE_ADMIN");
        }
        return AuthorityUtils.commaSeparatedStringToAuthorityList("ROLE_USER");
    }

    @Override
    public String getUsername() {
        return super.getName();
    }

    @Override
    public boolean isAccountNonExpired() {
        return super.getAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return super.getAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return super.getCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return super.getEnabled();
    }

    public NeuchatUserDetails(User user) {
        super(user.getId(), user.getName(), user.getEmail(), user.getPassword(), user.getAccountNonExpired(),
                user.getAccountNonLocked(), user.getCredentialsNonExpired(), user.getEnabled());

    }
}
