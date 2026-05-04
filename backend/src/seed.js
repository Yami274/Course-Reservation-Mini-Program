require('dotenv').config();
const { sequelize, User, Category, Location, Teacher, Course, CourseType, CourseSchedule, Banner, Notice } = require('./models');

async function seed() {
  console.log('Syncing database...');
  await sequelize.sync({ force: true });
  console.log('Database synced.');

  // 1. 创建默认管理员
  const admin = await User.create({
    openid: 'admin_test_openid',
    nickname: 'admin',
    avatar: '',
    phone: '',
    role: 'admin'
  });
  console.log('Admin created:', admin.nickname);

  // 2. 创建画室分类（匹配原型）
  const categories = await Category.bulkCreate([
    { name: '启蒙绘画', icon: '🖍️', sort: 1 },
    { name: '国画课',   icon: '🎋', sort: 2 },
    { name: '水彩',     icon: '🎨', sort: 3 },
    { name: '创意手作', icon: '✂️', sort: 4 },
    { name: '硬笔书法', icon: '✍️', sort: 5 },
    { name: '陶艺',     icon: '🏺', sort: 6 },
    { name: '速写',     icon: '🖌️', sort: 7 },
    { name: '油画',     icon: '🖼️', sort: 8 },
  ]);
  console.log('Categories created:', categories.length);

  // 3. 创建上课地点
  const locations = await Location.bulkCreate([
    { name: '城西分馆', address: '杭州市西湖区文一西路388号创意园3F-308', latitude: 30.280, longitude: 120.120, contact: '0571-8888-2026' },
    { name: '万达校区', address: '杭州市拱墅区万达广场3楼301室',         latitude: 30.330, longitude: 120.130, contact: '13800138000' },
  ]);
  console.log('Locations created:', locations.length);

  // 4. 创建讲师（匹配原型）
  const teachers = await Teacher.bulkCreate([
    { name: '安然', avatar: '', title: '画室主理人 / 8年少儿艺术教育', intro: '毕业于中央美院，曾任职于北京某知名儿童美术机构。相信每个孩子都是天生的艺术家，课堂里没有「画错」，只有「下一种可能」。' },
    { name: '周一', avatar: '', title: '央美油画系硕士 / 12年教学',     intro: '央美油画系硕士，自由画家。开设成人速写工作坊12年，相信观察是一切创作的起点。' },
    { name: '林夏', avatar: '', title: '国美雕塑系 / 6年创意教学',      intro: '毕业于中国美院雕塑系，擅长黏土手作与综合材料创作，课堂生动有趣，深受孩子们喜爱。' },
    { name: '陈墨', avatar: '', title: '书法教育家 / 10年教学经验',     intro: '省书法家协会会员，专注青少年硬笔与软笔书法教学，培养学生在全国比赛中多次获奖。' },
  ]);
  console.log('Teachers created:', teachers.length);

  // 5. 创建课程（匹配原型）
  const courses = await Course.bulkCreate([
    {
      category_id: categories[0].id, // 启蒙绘画
      title: '色彩启蒙·小小毕加索',
      intro: '<p>通过游戏化的色彩练习，引导孩子用颜色记录生活、表达情绪。课程包含基础三原色、调色游戏、自由创作三大主题，每节课产出一幅完整作品。</p>',
      teacher_ids: [teachers[0].id],
      location_ids: [locations[0].id, locations[1].id],
      status: 'published',
    },
    {
      category_id: categories[1].id, // 国画课
      title: '水墨花鸟·国画入门',
      intro: '<p>从认识笔墨纸砚开始，学习基础笔法与墨色变化。每节课完成一幅花鸟小品，在传统美学中培养专注力与审美力。</p>',
      teacher_ids: [teachers[0].id],
      location_ids: [locations[0].id],
      status: 'published',
    },
    {
      category_id: categories[2].id, // 水彩
      title: '童趣水彩·春之花园',
      intro: '<p>以春日花园为主题，学习水彩的基本技法——晕染、叠色、留白。适合有一定绘画基础的孩子，用水彩捕捉自然之美。</p>',
      teacher_ids: [teachers[0].id],
      location_ids: [locations[0].id],
      status: 'published',
    },
    {
      category_id: categories[3].id, // 创意手作
      title: '创意黏土·手作工坊',
      intro: '<p>通过揉、捏、搓、压等基础手法，创作立体作品。培养孩子的空间想象力与手部精细动作，每期一个主题系列。</p>',
      teacher_ids: [teachers[2].id],
      location_ids: [locations[1].id],
      status: 'published',
    },
    {
      category_id: categories[4].id, // 硬笔书法
      title: '硬笔书法·一笔一画',
      intro: '<p>从正确的握笔姿势开始，循序渐进学习基本笔画与间架结构。培养良好的书写习惯，让孩子写出一手漂亮的汉字。</p>',
      teacher_ids: [teachers[3].id],
      location_ids: [locations[0].id, locations[1].id],
      status: 'published',
    },
    {
      category_id: categories[6].id, // 速写
      title: '速写八周·零基础入门',
      intro: '<p>从最简单的几何形入门，每周一个观察主题——线条、明暗、结构、空间。八周后你将拥有一本属于自己的速写本，与一双懂得观察的眼睛。</p>',
      teacher_ids: [teachers[1].id],
      location_ids: [locations[0].id],
      status: 'published',
    },
    {
      category_id: categories[7].id, // 油画
      title: '周末油画·静物写生',
      intro: '<p>从构图、调色到笔触表现，系统学习油画的基本技法。以静物写生为载体，建立对色彩与造型的深层理解。</p>',
      teacher_ids: [teachers[3].id],
      location_ids: [locations[1].id],
      status: 'published',
    },
    {
      category_id: categories[1].id, // 国画课
      title: '夜间国画·禅意水墨',
      intro: '<p>在静夜中感受水墨的禅意。从写意花鸟到山水小品，每节课完成一幅完整作品，适合成人零基础入门。</p>',
      teacher_ids: [teachers[0].id],
      location_ids: [locations[0].id],
      status: 'published',
    },
    {
      category_id: categories[6].id, // 速写
      title: '周三夜·人体速写',
      intro: '<p>以人体动态为主要题材，训练快速捕捉形态的能力。适合有一定绘画基础的学员，提升造型能力与表现力。</p>',
      teacher_ids: [teachers[1].id],
      location_ids: [locations[0].id],
      status: 'published',
    },
    {
      category_id: categories[1].id, // 国画课
      title: '周日松烟·写意花鸟',
      intro: '<p>在周末的闲暇时光中，研习写意花鸟的传统笔墨语言。从梅兰竹菊到翎毛走兽，感受中国画的意境之美。</p>',
      teacher_ids: [teachers[1].id, teachers[0].id],
      location_ids: [locations[0].id],
      status: 'published',
    },
  ]);
  console.log('Courses created:', courses.length);

  // 6. 为每个课程创建班型和时段 — 差异化定价
  const today = new Date();
  const dayMs = 24 * 3600 * 1000;

  // 差异化定价方案：每个课程的价格、班型名、容量各不相同
  const pricingTable = [
    { type1: { name: '启蒙班', price: 128, capacity: 15 }, type2: { name: '进阶班', price: 188, capacity: 12 } },
    { type1: { name: '启蒙班', price: 158, capacity: 16 }, type2: { name: '进阶班', price: 218, capacity: 10 } },
    { type1: { name: '启蒙班', price: 138, capacity: 14 }, type2: { name: '进阶班', price: 198, capacity: 12 } },
    { type1: { name: '启蒙班', price: 118, capacity: 18 }, type2: { name: '进阶班', price: 168, capacity: 12 } },
    { type1: { name: '启蒙班', price: 148, capacity: 15 }, type2: { name: '进阶班', price: 208, capacity: 10 } },
    { type1: { name: '基础班', price: 198, capacity: 15 } },
    { type1: { name: '基础班', price: 258, capacity: 12 } },
    { type1: { name: '基础班', price: 228, capacity: 15 } },
    { type1: { name: '基础班', price: 288, capacity: 10 } },
    { type1: { name: '基础班', price: 238, capacity: 12 } },
  ];

  for (let ci = 0; ci < courses.length; ci++) {
    const course = courses[ci];
    const pricing = pricingTable[ci];

    // 创建第一个班型
    const type1 = await CourseType.create({
      course_id: course.id,
      name: pricing.type1.name,
      capacity: pricing.type1.capacity,
      price: pricing.type1.price,
    });

    // 有 type2 则创建第二个班型
    let type2 = null;
    if (pricing.type2) {
      type2 = await CourseType.create({
        course_id: course.id,
        name: pricing.type2.name,
        capacity: pricing.type2.capacity,
        price: pricing.type2.price,
      });
    }

    const isKids = pricing.type2 != null;

    // 为班型创建时段 — 往后4周的周末
    const timeSlots = isKids
      ? [{ start: '09:30:00', end: '11:00:00' }, { start: '14:00:00', end: '15:30:00' }]
      : [{ start: '19:00:00', end: '21:00:00' }, { start: '14:00:00', end: '16:00:00' }];

    for (let week = 0; week < 4; week++) {
      // 周六
      const sat = new Date(today.getTime() + dayMs * ((6 - today.getDay() + 7) % 7 + week * 7));
      for (const slot of timeSlots) {
        // 随机已预约人数，范围 0 ~ max+2，有一定概率满员
        const booked = Math.floor(Math.random() * (pricing.type1.capacity + 3));
        await CourseSchedule.create({
          course_type_id: type1.id,
          date: sat.toISOString().slice(0, 10),
          start_time: slot.start,
          end_time: slot.end,
          max_count: pricing.type1.capacity,
          booked_count: Math.min(booked, pricing.type1.capacity + 2),
          status: booked >= pricing.type1.capacity ? 'full' : 'active',
        });
        if (type2) {
          const booked2 = Math.floor(Math.random() * (pricing.type2.capacity + 3));
          await CourseSchedule.create({
            course_type_id: type2.id,
            date: sat.toISOString().slice(0, 10),
            start_time: slot.start === '09:30:00' ? '16:00:00' : '09:30:00',
            end_time: slot.start === '09:30:00' ? '17:30:00' : '11:00:00',
            max_count: pricing.type2.capacity,
            booked_count: Math.min(booked2, pricing.type2.capacity + 2),
            status: booked2 >= pricing.type2.capacity ? 'full' : 'active',
          });
        }
      }

      // 周日
      const sun = new Date(sat.getTime() + dayMs);
      for (const slot of timeSlots) {
        const booked = Math.floor(Math.random() * (pricing.type1.capacity + 3));
        await CourseSchedule.create({
          course_type_id: type1.id,
          date: sun.toISOString().slice(0, 10),
          start_time: slot.start,
          end_time: slot.end,
          max_count: pricing.type1.capacity,
          booked_count: Math.min(booked, pricing.type1.capacity + 2),
          status: booked >= pricing.type1.capacity ? 'full' : 'active',
        });
        if (type2) {
          const booked2 = Math.floor(Math.random() * (pricing.type2.capacity + 3));
          await CourseSchedule.create({
            course_type_id: type2.id,
            date: sun.toISOString().slice(0, 10),
            start_time: slot.start === '09:30:00' ? '16:00:00' : '09:30:00',
            end_time: slot.start === '09:30:00' ? '17:30:00' : '11:00:00',
            max_count: pricing.type2.capacity,
            booked_count: Math.min(booked2, pricing.type2.capacity + 2),
            status: booked2 >= pricing.type2.capacity ? 'full' : 'active',
          });
        }
      }
    }
  }
  console.log('Course types and schedules created.');

  // 7. 轮播图
  await Banner.bulkCreate([
    { image: '', title: '春日色彩\n绘画工坊', subtitle: '4-12岁 · 周末班招募中', link_url: '', sort: 1, status: 'active' },
    { image: '', title: '成人速写\n夜间班', subtitle: '零基础 · 八周入门', link_url: '', sort: 2, status: 'active' },
    { image: '', title: '水彩花卉\n进阶班', subtitle: '国际课程体系 · 系统培养', link_url: '', sort: 3, status: 'active' },
  ]);
  console.log('Banners created.');

  // 8. 公告
  await Notice.bulkCreate([
    {
      content: '五一假期排课调整，部分课程时间有所变动，详情请查看最新排课表 →',
      start_date: today.toISOString().slice(0, 10),
      end_date: new Date(today.getTime() + 14 * dayMs).toISOString().slice(0, 10),
      status: 'active',
    },
    {
      content: '新学员首次报名可享体验价，欢迎联系客服咨询！',
      start_date: today.toISOString().slice(0, 10),
      end_date: new Date(today.getTime() + 60 * dayMs).toISOString().slice(0, 10),
      status: 'active',
    },
  ]);
  console.log('Notices created.');

  console.log('\n✅ Seed completed!');
  console.log('   Admin: username=admin, password=admin123');
  console.log(`   Courses: ${courses.length} | Teachers: ${teachers.length} | Categories: ${categories.length}`);
  process.exit(0);
}

seed().catch(e => {
  console.error('Seed failed:', e);
  process.exit(1);
});
