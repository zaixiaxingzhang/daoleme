class DaolemaApp {
    constructor() {
        this.records = JSON.parse(localStorage.getItem('daolemaRecords')) || [];
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.selectedDate = null;
        this.selectedElement = null;
        
        this.init();
    }
    
    init() {
        this.renderCalendar();
        this.updateStats();
        this.bindEvents();
    }
    
    bindEvents() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.changeMonth(-1);
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            this.changeMonth(1);
        });
        
        document.getElementById('add-record').addEventListener('click', () => {
            this.addRecordForSelectedDate();
        });
        
        document.getElementById('remove-record').addEventListener('click', () => {
            this.removeRecordForSelectedDate();
        });
    }
    
    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.renderCalendar();
    }
    
    renderCalendar() {
        // 更新月份年份显示
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        document.getElementById('current-month-year').textContent = 
            `${this.currentYear}年 ${monthNames[this.currentMonth]}`;
        
        // 清空日历
        const daysContainer = document.getElementById('calendar-days');
        daysContainer.innerHTML = '';
        
        // 获取月份第一天是周几
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        // 获取月份总天数
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        
        // 添加空白日期
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day';
            daysContainer.appendChild(emptyDay);
        }
        
        // 添加日期
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.innerHTML = `<span class="day-number">${day}</span>`;
            
            // 检查是否是今天
            if (this.currentYear === today.getFullYear() && 
                this.currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // 显示导发次数
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const count = this.getRecordCount(dateStr);
            if (count > 0) {
                dayElement.classList.add('has-record');
                dayElement.innerHTML = `<span class="day-number">${day}</span><span class="count">${count}</span>`;
            }
            
            // 添加点击事件 - 仅用于选择日期
            dayElement.addEventListener('click', () => {
                this.selectDate(dateStr, dayElement);
            });
            
            daysContainer.appendChild(dayElement);
        }
    }
    
    getRecordCount(dateStr) {
        return this.records.filter(record => record.date === dateStr).length;
    }
    
    selectDate(dateStr, element) {
        // 移除之前选中日期的样式
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
        }
        
        // 设置新选中的日期
        this.selectedDate = dateStr;
        this.selectedElement = element;
        element.classList.add('selected');
    }
    
    addRecordForSelectedDate() {
        if (!this.selectedDate || !this.selectedElement) {
            alert('请先选择一个日期');
            return;
        }
        
        this.records.push({ date: this.selectedDate, timestamp: Date.now() });
        this.saveRecords();
        this.updateStats();
        this.updateDayDisplay(this.selectedDate, this.selectedElement);
    }
    
    removeRecordForSelectedDate() {
        if (!this.selectedDate || !this.selectedElement) {
            alert('请先选择一个日期');
            return;
        }
        
        // 找到选中日期的记录并删除一个
        const index = this.records.findIndex(record => record.date === this.selectedDate);
        if (index > -1) {
            this.records.splice(index, 1);
            this.saveRecords();
            this.updateStats();
            this.updateDayDisplay(this.selectedDate, this.selectedElement);
        }
    }
    
    addRecord() {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // 找到今天的元素
        const todayElements = document.querySelectorAll('.day');
        let todayElement = null;
        const today = new Date();
        
        // 重新渲染日历以确保显示正确月份
        if (this.currentYear !== today.getFullYear() || this.currentMonth !== today.getMonth()) {
            this.currentYear = today.getFullYear();
            this.currentMonth = today.getMonth();
            this.renderCalendar();
            return;
        }
        
        this.records.push({ date: dateStr, timestamp: now.getTime() });
        this.saveRecords();
        this.updateStats();
        
        // 更新日历显示
        this.renderCalendar();
        
        // 显示动画反馈
        const button = document.getElementById('add-record');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    removeRecord() {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // 找到今天的记录并删除一个
        const index = this.records.findIndex(record => record.date === dateStr);
        if (index > -1) {
            this.records.splice(index, 1);
            this.saveRecords();
            this.updateStats();
            this.renderCalendar();
            
            // 显示动画反馈
            const button = document.getElementById('remove-record');
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    }
    
    updateDayDisplay(dateStr, element) {
        const count = this.getRecordCount(dateStr);
        const dayNumber = element.querySelector('.day-number').textContent;
        if (count > 0) {
            element.classList.add('has-record');
            element.innerHTML = `<span class="day-number">${dayNumber}</span><span class="count">${count}</span>`;
        } else {
            element.classList.remove('has-record');
            element.innerHTML = `<span class="day-number">${dayNumber}</span>`;
        }
    }
    
    saveRecords() {
        localStorage.setItem('daolemaRecords', JSON.stringify(this.records));
    }
    
    updateStats() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        // 修改周统计计算逻辑：周一到周日算一周
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday as start of week
        startOfWeek.setDate(now.getDate() - daysSinceMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // 计算统计数据
        const total = this.records.length;
        const thisYear = this.records.filter(record => 
            new Date(record.date).getFullYear() === now.getFullYear()
        ).length;
        
        // 周统计计算逻辑（周一到周日）
        const thisWeek = this.records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= startOfWeek && recordDate <= endOfWeek;
        }).length;
        
        // 更新显示
        document.getElementById('week-count').textContent = thisWeek;
        document.getElementById('total-count').textContent = total;
        document.getElementById('year-count').textContent = thisYear;
        
        // 更新建议
        const recommendation = document.getElementById('recommendation');
        if (thisWeek >= 4) {
            recommendation.textContent = '不建议';
            recommendation.style.color = '#e74c3c';
        } else if (thisWeek >= 3) {
            recommendation.textContent = '谨慎考虑';
            recommendation.style.color = '#f39c12';
        } else {
            recommendation.textContent = '可以考虑';
            recommendation.style.color = '#27ae60';
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new DaolemaApp();
});