// ============ 🔧 配置区：请替换为你的 Supabase 信息 ============
const SUPABASE_URL = 'https://vbxeluvxcxipectqdnoa.supabase.co'; // ❗替换为你的项目 URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieGVsdXZ4Y3hpcGVjdHFkbm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTA0NDQsImV4cCI6MjA3MDU2NjQ0NH0.ezbppvPMMDcv644HoeLVJIhJ3ulxCjo6ez5a5HqEzbs'; // ❗替换为你的 anon public key
// ==========================================================

// 初始化 Supabase 客户端
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let selectedTag = ''; // 默认选中的标签为空

document.addEventListener('DOMContentLoaded', async () => {
    await loadMessages();
    setupTagButtons();
    setupModal();
});

function setupTagButtons() {
    const buttons = document.querySelectorAll('.tag-button');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // 阻止事件冒泡
            e.stopPropagation();

            // 获取按钮的标签值
            const tagValue = button.getAttribute('data-tag');

            // 在输入框中插入标签
            const textarea = document.getElementById('messageInput');
            textarea.value = `#${tagValue}  `;

            // 设置光标位置到输入框末尾
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);

            // 更新选中的标签
            selectedTag = tagValue;

            // 移除所有按钮的 active 类
            buttons.forEach(btn => btn.classList.remove('active'));
            // 添加当前点击按钮的 active 类
            button.classList.add('active');
        });
    });
}

// 表单提交事件
document.getElementById('messageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const textarea = document.getElementById('messageInput');
    const content = textarea.value.trim();

    if (!content) return;

    // 显示加载状态（可选）
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';

    // 插入到 Supabase
    const { error } = await supabaseClient
        .from('messages')
        .insert([{ content, tag: selectedTag || '无标签' }]);

    if (error) {
        console.error('提交失败:', error);
        alert('提交失败，请检查网络或重试');
    } else {
        textarea.value = '';
        await loadMessages(); // 刷新消息列表
    }

    // 恢复按钮状态
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
});

// 从 Supabase 加载消息
async function loadMessages() {
    const container = document.getElementById('messagesContainer');
    // 保留 h2 标题
    const title = container.querySelector('h2');
    container.innerHTML = '';
    container.appendChild(title);

    const { data, error } = await supabaseClient
        .from('messages')
        .select('content, created_at, tag')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('加载失败:', error);
        container.insertAdjacentHTML('beforeend', `
            <p style="color: #999; font-style: italic; text-align: center; padding: 1.5rem;">
                数据加载失败，请稍后重试
            </p>
        `);
        return;
    }

    if (data.length === 0) {
        container.insertAdjacentHTML('beforeend', `
            <p style="color: var(--lighter-text); font-style: italic; text-align: center; padding: 2rem;">
                还没有人留下痕迹，成为第一个书写的人吧 🌱
            </p>
        `);
        return;
    }

    // 渲染每条消息
    data.forEach(item => {
        const date = new Date(item.created_at);
        const dateStr = `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;

        const messageEl = document.createElement('div');
        messageEl.className = 'message';
        messageEl.setAttribute('data-full-content', item.content);
        messageEl.setAttribute('data-date', dateStr);
        messageEl.setAttribute('data-tag', item.tag || '无标签');
        messageEl.innerHTML = `
            <div class="message-content">${truncateText(item.content || '', 200)}</div>
            <div class="message-time">${dateStr} - ${escapeHtml(item.tag || '无标签')}</div>
        `;
        messageEl.addEventListener('click', showDetails);
        container.appendChild(messageEl);
    });
}

// 截断文本
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

// 显示详细信息
function showDetails(event) {
    const messageElement = event.currentTarget;
    const fullContent = messageElement.getAttribute('data-full-content');
    const date = messageElement.getAttribute('data-date');
    const tag = messageElement.getAttribute('data-tag');

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalMessageContent');
    const modalTime = document.getElementById('modalMessageTime');

    modalContent.textContent = escapeHtml(fullContent);
    modalTime.textContent = `${date} - ${escapeHtml(tag)}`;

    modal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// 设置模态框关闭事件
function setupModal() {
    const closeBtn = document.querySelector('.close');
    const modal = document.getElementById('modal');

    closeBtn.addEventListener('click', closeModal);

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };
}

// 防止 XSS：转义 HTML 特殊字符
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}