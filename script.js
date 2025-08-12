
document.getElementById('messageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const messageInput = this.querySelector('textarea');
    const message = messageInput.value.trim();

    if (message) {
        // 获取当前时间
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const dateStr = `${year}年${month}月${day}日`;

        // 创建新消息元素
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${dateStr}</div>
        `;

        // 将新消息插入到消息容器的最前面
        const messagesContainer = document.getElementById('messagesContainer');
        const firstMessage = messagesContainer.querySelector('.message');
        if (firstMessage) {
            messagesContainer.insertBefore(messageElement, firstMessage);
        } else {
            // 如果没有现有消息，就追加到消息容器中
            messagesContainer.appendChild(messageElement);
        }

        // 清空输入框
        messageInput.value = '';
    }
});

// 导航栏交互
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
            item.addEventListener('click', function() {
                navItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // 点击时的灵动效果
                this.style.transform = 'translateY(2px)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });
