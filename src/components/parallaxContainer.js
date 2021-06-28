import React from 'react';
import PropTypes from 'prop-types';
import { Animated, Easing, StyleSheet, Text, Image, Alert, Button, TouchableHighlight } from 'react-native'
import { Container, Header, View, Icon, Fab, Content, Body, Thumbnail, Input } from 'native-base';
import { SafeAreaView } from 'react-native-safe-area-context';
import appMetrics from '../styles/metrics.js';
export default class ParallaxContainer extends React.Component {
    static propsTypes = {
        renderHeaderContent: PropTypes.func.isRequired,
        renderScroller: PropTypes.func.isRequired,
        
    };

    constructor(props) {
        super(props);
        // this.scrollAnim=new Animated.Value(0);
        this.scrollY = new Animated.Value(0);


        this.handleScroll = this.handleScroll.bind(this);
        this.state = {

        }
    }
    render() {
        const { renderScroller, renderHeaderContent } = this.props;
        const scrollY = this.scrollY;
        const { parallaxHeaderScrollDistance: dist } = appMetrics;

        const scrollViewContentTranslate = scrollY.interpolate({
            inputRange: [0, dist],
            outputRange: [dist, 0],
            extrapolate: 'clamp'
        });
        const headerContentTranslate = scrollY.interpolate({
            inputRange: [0, dist],
            outputRange: [0, -60],
            extrapolate: 'clamp'
        });
        return (
            <SafeAreaView>
                <Animated.View style={[
                    styles.scrollViewContent, {
                        transform: [
                            {
                                translateY: scrollViewContentTranslate
                            }
                        ]
                    }
                ]}>{
                        renderScroller({
                            scrollEventThrottle: 16,
                            onScroll: this.handleScroll
                        })
                    }</Animated.View>
                <Animated.View style={[
                    styles.headerContent, {
                        transform: [
                            {
                                translateY: headerContentTranslate
                            }
                        ]
                    }
                ]}>{renderHeaderContent({})}</Animated.View>
            {this.props.children}
            </SafeAreaView>
        );
    }
    handleScroll(e) {
        const y = e.nativeEvent.contentOffset.y;
        /*
         * Since the scroll view itself is translating, the content offset (y)
         * does not only depend on the touch move gesture and may fluctuate.
         * To smooth out the content offset, we average its values in a small
         * window (5 in this case).
         */
        const trace = this.scrollYTrace;
        trace.push(y);
        if (trace.length > 5) {
            trace.shift();
            let sum = 0;
            for (let t of trace)
                sum += t;
            this.scrollY.setValue(sum / 5);
        }
    }
}

const styles = StyleSheet.create({
    scrollViewContent: {
        flex: 1,
        marginTop: appMetrics.parallaxHeaderMinHeight
    },
    headerContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: appMetrics.parallaxHeaderMaxHeight
    },
})