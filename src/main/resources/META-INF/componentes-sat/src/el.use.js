;
(function () {
    "use strict";

    var counter = WC.createDefinitionComponent({
        tagName: "div",
        state: {
            counter: 0
        },
        attributes: {
            "class": "counter-container"
        },
        events: {
            'increment-count': function(evt) {
                evt.ctx.setState(function(oldState) {
                    return {
                        counter: oldState.counter + 1
                    }
                });
            }
        },
        children: [
            WC.createDefinitionComponent({
                tagName: "img",
                attributes: {
                    "class": "counter-image",
                    "src": "https://picsum.photos/100/100"
                },
                events: {
                    'click': function (evt) {
                        evt.ctx.dispatch("increment-count");
                    }
                }
            }),
            function (props, state) {
                return WC.createDefinitionComponent({
                    tagName: "div",
                    props: {
                        counter: state.counter
                    },
                    attributes: {
                        "class": "counter-label"
                    },
                    children: [
                        "El conteo es: ",
                        function (props) {
                            return WC.createDefinitionComponent({
                                tagName: "span",
                                children: [
                                    props.counter
                                ]
                            })
                        }
                    ]
                })
            }
        ]
    });

    WCDOM.render( counter, document.getElementById("el-img"));

})();