/*
 * Copyright 2012-2018 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.suricate.monitoring.model.entity;

import io.suricate.monitoring.model.entity.widget.Widget;
import lombok.*;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Library entity
 */
@Entity
@Getter @Setter @NoArgsConstructor @EqualsAndHashCode(callSuper = false) @ToString
public class Library extends AbstractAuditingEntity<Long>{

    /**
     * The id
     */
    @Id
    @GeneratedValue
    private Long id;

    /**
     * The technical name
     */
    @Column(nullable = false, unique = true)
    private String technicalName;

    /**
     * The asset
     */
    @OneToOne(cascade = {CascadeType.REMOVE, CascadeType.DETACH})
    private Asset asset;

    /**
     * The list of widgets related to it
     */
    @ManyToMany(mappedBy = "libraries")
    private List<Widget> widgets = new ArrayList<>();

    /**
     * Constructor minimal
     *
     * @param technicalName The technical name
     */
    public Library(String technicalName) {
        this.technicalName = technicalName;
    }
}
