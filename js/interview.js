/* interview.js */
const SUPABASE_URL = 'https://vbxeluvxcxipectqdnoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieGVsdXZ4Y3hpcGVjdHFkbm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTA0NDQsImV4cCI6MjA3MDU2NjQ0NH0.ezbppvPMMDcv644HoeLVJIhJ3ulxCjo6ez5a5HqEzbs'; // ❗替换为你的 anon public key

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let interviewData = [];           // 全部面试手记
let grouped = {};                 // 按日期分组

/* 初始化 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadInterviewNotes();
    renderTimeline();
    renderCards();
    setupModal();

    // 默认高亮第一个时间轴项
    if (document.querySelector('.timeline-item')) {
        document.querySelector('.timeline-item').classList.add('active');
    }
});

/* 1. 加载数据 */
async function loadInterviewNotes() {
    const { data, error } = await supabaseClient
        .from('messages')
        .select('content, created_at, tag')
        .eq('tag', '面试手记')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }
    interviewData = data;
    // 按日期分组：2025-08-13 -> [msg1, msg2...]
    grouped = groupByDate(data);
}



function groupByDate(arr) {
    return arr.reduce((acc, cur) => {
        const day = cur.created_at.slice(0, 10);
        (acc[day] = acc[day] || []).push(cur);
        return acc;
    }, {});
}

/* 2. 渲染左侧时间轴 */
function renderTimeline() {
    const timelineEl = document.getElementById('timeline');
    Object.keys(grouped).sort((a, b) => b.localeCompare(a))
        .forEach(date => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.textContent = formatDateForDisplay(date);
            div.onclick = () => scrollToDate(date);
            timelineEl.appendChild(div);
        });
}

/* 3. 渲染右侧卡片 */
function renderCards(dateFilter = null) {
    const container = document.getElementById('interviewCards');
    container.innerHTML = '';

    // 按日期排序
    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach(date => {
        // 如果有日期过滤且不匹配则跳过
        if (dateFilter && date !== dateFilter) return;

        // 创建日期标题
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        const formattedDate = formatDateForDisplay(date);
        dateHeader.textContent = formattedDate;
        container.appendChild(dateHeader);

        // 创建该日期的所有卡片
        grouped[date].forEach(item => {
            const card = document.createElement('div');
            card.className = 'message';
            card.setAttribute('data-full-content', item.content);
            card.setAttribute('data-date', formattedDate);
            card.setAttribute('data-tag', item.tag || '无标签');
            card.innerHTML = `
                <div class="message-content">${truncateText(item.content || '', 100)}</div>
            `;
            card.addEventListener('click', showDetails);
            container.appendChild(card);
        });
    });
}

// 辅助函数：格式化日期显示
function formatDateForDisplay(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${year}年${month}月${day}日`;
}

/* 4. 时间轴点击 -> 滚动定位到对应日期的卡片 */
function scrollToDate(date) {
    renderCards(date);

    // 滚动到顶部（因为现在每次点击都会重新渲染）
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 高亮选中的时间轴项
    document.querySelectorAll('.timeline-item').forEach(item => {
        item.classList.toggle('active', item.textContent === formatDateForDisplay(date));
    });
}

/* 5. 模态框（复用已有逻辑） */
function showDetails(e) {
    const el = e.currentTarget;
    const fullContent = el.getAttribute('data-full-content');
    const date = el.getAttribute('data-date');
    const tag = el.getAttribute('data-tag');

    document.getElementById('modalMessageContent').textContent = fullContent;
    document.getElementById('modalMessageTime').textContent = `${date} - ${tag}`;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function setupModal() {
    document.querySelector('.close').onclick = closeModal;
    window.onclick = e => {
        if (e.target === document.getElementById('modal')) closeModal();
    };
}

function truncateText(text, max) {
    return text.length <= max ? text : text.substring(0, max) + '...';
}
