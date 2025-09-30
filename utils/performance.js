// 性能监控工具
export class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
    }

    // 开始测量
    startMeasure(name) {
        this.metrics[name] = {
            startTime: performance.now()
        };
    }

    // 结束测量
    endMeasure(name) {
        if (this.metrics[name]) {
            this.metrics[name].endTime = performance.now();
            this.metrics[name].duration = this.metrics[name].endTime - this.metrics[name].startTime;
            return this.metrics[name].duration;
        }
        return 0;
    }

    // 获取页面加载性能
    getPageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint(),
            largestContentfulPaint: this.getLargestContentfulPaint()
        };
    }

    // 获取首次绘制时间
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        return fpEntry ? fpEntry.startTime : 0;
    }

    // 获取首次内容绘制时间
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : 0;
    }

    // 获取最大内容绘制时间
    getLargestContentfulPaint() {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
    }

    // 获取累积布局偏移
    getCumulativeLayoutShift() {
        const clsEntries = performance.getEntriesByType('layout-shift');
        return clsEntries.reduce((sum, entry) => sum + entry.value, 0);
    }

    // 获取首次输入延迟
    getFirstInputDelay() {
        const fidEntries = performance.getEntriesByType('first-input');
        return fidEntries.length > 0 ? fidEntries[0].processingStart - fidEntries[0].startTime : 0;
    }

    // 获取所有性能指标
    getAllMetrics() {
        return {
            ...this.getPageLoadMetrics(),
            cumulativeLayoutShift: this.getCumulativeLayoutShift(),
            firstInputDelay: this.getFirstInputDelay(),
            customMetrics: this.metrics
        };
    }

    // 报告性能指标
    reportMetrics() {
        const metrics = this.getAllMetrics();
        console.log('Performance Metrics:', metrics);
        return metrics;
    }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 自动开始监控
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            performanceMonitor.reportMetrics();
        }, 1000);
    });
}
