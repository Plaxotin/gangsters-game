// Винтажная тема карты в стиле 1920-х годов
// Основана на документации Yandex Maps API customization
const vintageMapTheme = [
    {
        "tags": "country",
        "elements": "geometry.fill",
        "stylers": [
            {
                "color": "#d4c4a8"
            },
            {
                "opacity": 0.8,
                "zoom": 0
            },
            {
                "opacity": 0.8,
                "zoom": 1
            },
            {
                "opacity": 0.8,
                "zoom": 2
            },
            {
                "opacity": 0.8,
                "zoom": 3
            },
            {
                "opacity": 0.8,
                "zoom": 4
            },
            {
                "opacity": 1,
                "zoom": 5
            },
            {
                "opacity": 1,
                "zoom": 6
            },
            {
                "opacity": 1,
                "zoom": 7
            },
            {
                "opacity": 1,
                "zoom": 8
            },
            {
                "opacity": 1,
                "zoom": 9
            },
            {
                "opacity": 1,
                "zoom": 10
            },
            {
                "opacity": 1,
                "zoom": 11
            },
            {
                "opacity": 1,
                "zoom": 12
            },
            {
                "opacity": 1,
                "zoom": 13
            },
            {
                "opacity": 1,
                "zoom": 14
            },
            {
                "opacity": 1,
                "zoom": 15
            },
            {
                "opacity": 1,
                "zoom": 16
            },
            {
                "opacity": 1,
                "zoom": 17
            },
            {
                "opacity": 1,
                "zoom": 18
            },
            {
                "opacity": 1,
                "zoom": 19
            },
            {
                "opacity": 1,
                "zoom": 20
            },
            {
                "opacity": 1,
                "zoom": 21
            }
        ]
    },
    {
        "tags": "country",
        "elements": "geometry.outline",
        "stylers": [
            {
                "color": "#8b7355"
            },
            {
                "opacity": 0.15,
                "zoom": 0
            },
            {
                "opacity": 0.15,
                "zoom": 1
            },
            {
                "opacity": 0.15,
                "zoom": 2
            },
            {
                "opacity": 0.15,
                "zoom": 3
            },
            {
                "opacity": 0.15,
                "zoom": 4
            },
            {
                "opacity": 0.15,
                "zoom": 5
            },
            {
                "opacity": 0.25,
                "zoom": 6
            },
            {
                "opacity": 0.5,
                "zoom": 7
            },
            {
                "opacity": 0.47,
                "zoom": 8
            },
            {
                "opacity": 0.44,
                "zoom": 9
            },
            {
                "opacity": 0.41,
                "zoom": 10
            },
            {
                "opacity": 0.38,
                "zoom": 11
            },
            {
                "opacity": 0.35,
                "zoom": 12
            },
            {
                "opacity": 0.33,
                "zoom": 13
            },
            {
                "opacity": 0.3,
                "zoom": 14
            },
            {
                "opacity": 0.28,
                "zoom": 15
            },
            {
                "opacity": 0.25,
                "zoom": 16
            },
            {
                "opacity": 0.25,
                "zoom": 17
            },
            {
                "opacity": 0.25,
                "zoom": 18
            },
            {
                "opacity": 0.25,
                "zoom": 19
            },
            {
                "opacity": 0.25,
                "zoom": 20
            },
            {
                "opacity": 0.25,
                "zoom": 21
            }
        ]
    },
    {
        "tags": "land",
        "elements": "geometry",
        "stylers": [
            {
                "color": "#f4f1eb",
                "zoom": 0
            },
            {
                "color": "#f4f1eb",
                "zoom": 1
            },
            {
                "color": "#f4f1eb",
                "zoom": 2
            },
            {
                "color": "#f4f1eb",
                "zoom": 3
            },
            {
                "color": "#f4f1eb",
                "zoom": 4
            },
            {
                "color": "#f0ebe0",
                "zoom": 5
            },
            {
                "color": "#ede7dc",
                "zoom": 6
            },
            {
                "color": "#eae3d8",
                "zoom": 7
            },
            {
                "color": "#e7dfd4",
                "zoom": 8
            },
            {
                "color": "#e4dbd0",
                "zoom": 9
            },
            {
                "color": "#e1d7cc",
                "zoom": 10
            },
            {
                "color": "#ded3c8",
                "zoom": 11
            },
            {
                "color": "#dbcfc4",
                "zoom": 12
            },
            {
                "color": "#d8cbc0",
                "zoom": 13
            },
            {
                "color": "#d5c7bc",
                "zoom": 14
            },
            {
                "color": "#d2c3b8",
                "zoom": 15
            },
            {
                "color": "#cfbfb4",
                "zoom": 16
            },
            {
                "color": "#ccbbb0",
                "zoom": 17
            },
            {
                "color": "#c9b7ac",
                "zoom": 18
            },
            {
                "color": "#c6b3a8",
                "zoom": 19
            },
            {
                "color": "#c3afa4",
                "zoom": 20
            },
            {
                "color": "#c0aba0",
                "zoom": 21
            }
        ]
    },
    {
        "tags": "water",
        "elements": "geometry",
        "stylers": [
            {
                "color": "#9ca89a",
                "zoom": 0
            },
            {
                "color": "#9ca89a",
                "zoom": 1
            },
            {
                "color": "#9ca89a",
                "zoom": 2
            },
            {
                "color": "#9ca89a",
                "zoom": 3
            },
            {
                "color": "#9ca89a",
                "zoom": 4
            },
            {
                "color": "#9ca89a",
                "zoom": 5
            },
            {
                "color": "#9ca89a",
                "zoom": 6
            },
            {
                "color": "#9ca89a",
                "zoom": 7
            },
            {
                "color": "#a0ac9e",
                "zoom": 8
            },
            {
                "color": "#a4b0a2",
                "zoom": 9
            },
            {
                "color": "#a8b4a6",
                "zoom": 10
            },
            {
                "color": "#acb8aa",
                "zoom": 11
            },
            {
                "color": "#b0bcae",
                "zoom": 12
            },
            {
                "color": "#b4c0b2",
                "zoom": 13
            },
            {
                "color": "#b8c4b6",
                "zoom": 14
            },
            {
                "color": "#bcc8ba",
                "zoom": 15
            },
            {
                "color": "#c0ccbe",
                "zoom": 16
            },
            {
                "color": "#c4d0c2",
                "zoom": 17
            },
            {
                "color": "#c8d4c6",
                "zoom": 18
            },
            {
                "color": "#ccd8ca",
                "zoom": 19
            },
            {
                "color": "#d0dcce",
                "zoom": 20
            },
            {
                "color": "#d4e0d2",
                "zoom": 21
            }
        ]
    },
    {
        "tags": "building",
        "elements": "geometry.fill",
        "stylers": [
            {
                "color": "#c4b896"
            },
            {
                "opacity": 0.7,
                "zoom": 0
            },
            {
                "opacity": 0.7,
                "zoom": 1
            },
            {
                "opacity": 0.7,
                "zoom": 2
            },
            {
                "opacity": 0.7,
                "zoom": 3
            },
            {
                "opacity": 0.7,
                "zoom": 4
            },
            {
                "opacity": 0.7,
                "zoom": 5
            },
            {
                "opacity": 0.7,
                "zoom": 6
            },
            {
                "opacity": 0.7,
                "zoom": 7
            },
            {
                "opacity": 0.7,
                "zoom": 8
            },
            {
                "opacity": 0.7,
                "zoom": 9
            },
            {
                "opacity": 0.7,
                "zoom": 10
            },
            {
                "opacity": 0.7,
                "zoom": 11
            },
            {
                "opacity": 0.7,
                "zoom": 12
            },
            {
                "opacity": 0.7,
                "zoom": 13
            },
            {
                "opacity": 0.7,
                "zoom": 14
            },
            {
                "opacity": 0.7,
                "zoom": 15
            },
            {
                "opacity": 0.9,
                "zoom": 16
            },
            {
                "opacity": 0.6,
                "zoom": 17
            },
            {
                "opacity": 0.6,
                "zoom": 18
            },
            {
                "opacity": 0.6,
                "zoom": 19
            },
            {
                "opacity": 0.6,
                "zoom": 20
            },
            {
                "opacity": 0.6,
                "zoom": 21
            }
        ]
    },
    {
        "tags": "building",
        "elements": "geometry.outline",
        "stylers": [
            {
                "color": "#8b7355"
            },
            {
                "opacity": 0.5,
                "zoom": 0
            },
            {
                "opacity": 0.5,
                "zoom": 1
            },
            {
                "opacity": 0.5,
                "zoom": 2
            },
            {
                "opacity": 0.5,
                "zoom": 3
            },
            {
                "opacity": 0.5,
                "zoom": 4
            },
            {
                "opacity": 0.5,
                "zoom": 5
            },
            {
                "opacity": 0.5,
                "zoom": 6
            },
            {
                "opacity": 0.5,
                "zoom": 7
            },
            {
                "opacity": 0.5,
                "zoom": 8
            },
            {
                "opacity": 0.5,
                "zoom": 9
            },
            {
                "opacity": 0.5,
                "zoom": 10
            },
            {
                "opacity": 0.5,
                "zoom": 11
            },
            {
                "opacity": 0.5,
                "zoom": 12
            },
            {
                "opacity": 0.5,
                "zoom": 13
            },
            {
                "opacity": 0.5,
                "zoom": 14
            },
            {
                "opacity": 0.5,
                "zoom": 15
            },
            {
                "opacity": 0.5,
                "zoom": 16
            },
            {
                "opacity": 1,
                "zoom": 17
            },
            {
                "opacity": 1,
                "zoom": 18
            },
            {
                "opacity": 1,
                "zoom": 19
            },
            {
                "opacity": 1,
                "zoom": 20
            },
            {
                "opacity": 1,
                "zoom": 21
            }
        ]
    },
    {
        "tags": {
            "any": [
                "food_and_drink",
                "shopping",
                "commercial_services"
            ]
        },
        "stylers": {
            "visibility": "off"
        }
    },
    {
        "tags": {
            "any": [
                "transit"
            ]
        },
        "stylers": {
            "visibility": "off"
        }
    },
    {
        "tags": {
            "any": [
                "road_7"
            ]
        },
        "stylers": {
            "visibility": "off"
        }
    },
    {
        "tags": {
            "any": [
                "road_construction",
                "road_minor",
                "road_unclassified",
                "path",
                "road_limited"
            ]
        },
        "stylers": {
            "visibility": "off"
        }
    },
    // Дополнительные винтажные настройки для дорог
    {
        "tags": {
            "any": ["road_1", "road_2"]
        },
        "elements": "geometry.fill",
        "stylers": [
            {
                "color": "#f4f1eb"
            }
        ]
    },
    {
        "tags": {
            "any": ["road_1", "road_2"]
        },
        "elements": "geometry.outline",
        "stylers": [
            {
                "color": "#8b7355"
            }
        ]
    },
    {
        "tags": {
            "any": ["road_3", "road_4"]
        },
        "elements": "geometry.fill",
        "stylers": [
            {
                "color": "#f0ebe0"
            }
        ]
    },
    {
        "tags": {
            "any": ["road_3", "road_4"]
        },
        "elements": "geometry.outline",
        "stylers": [
            {
                "color": "#8b7355"
            }
        ]
    },
    // Винтажная стилизация парков и растительности
    {
        "tags": "vegetation",
        "elements": "geometry",
        "stylers": [
            {
                "color": "#aab6c0",
                "opacity": 0.3
            }
        ]
    },
    {
        "tags": "park",
        "elements": "geometry",
        "stylers": [
            {
                "color": "#aab6c0",
                "opacity": 0.4
            }
        ]
    },
    // Скрытие современных элементов
    {
        "tags": {
            "any": ["poi"]
        },
        "stylers": {
            "visibility": "off"
        }
    },
    {
        "tags": {
            "any": ["traffic_light"]
        },
        "stylers": {
            "visibility": "off"
        }
    },
    {
        "tags": {
            "any": ["entrance"]
        },
        "stylers": {
            "visibility": "off"
        }
    }
];
