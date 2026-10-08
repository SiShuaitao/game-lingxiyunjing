package com.shixingxu.lingxi.init;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.shixingxu.lingxi.entity.Banner;
import com.shixingxu.lingxi.entity.Character;
import com.shixingxu.lingxi.entity.Feature;
import com.shixingxu.lingxi.entity.Game;
import com.shixingxu.lingxi.entity.News;
import com.shixingxu.lingxi.entity.Sect;
import com.shixingxu.lingxi.mapper.BannerMapper;
import com.shixingxu.lingxi.mapper.CharacterMapper;
import com.shixingxu.lingxi.mapper.FeatureMapper;
import com.shixingxu.lingxi.mapper.GameMapper;
import com.shixingxu.lingxi.mapper.NewsMapper;
import com.shixingxu.lingxi.mapper.SectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 首次启动时初始化灵汐云境种子数据：游戏元数据、云境伙伴、秘境、玩法特色、Banner、资讯。
 */
@Slf4j
@Component
@Order(10)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final GameMapper gameMapper;
    private final NewsMapper newsMapper;
    private final BannerMapper bannerMapper;
    private final CharacterMapper characterMapper;
    private final SectMapper sectMapper;
    private final FeatureMapper featureMapper;

    @Override
    public void run(String... args) {
        seedGame();
        seedCharacters();
        seedSects();
        seedFeatures();
        seedBanners();
        seedNews();
    }

    private void seedGame() {
        Long count = gameMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("游戏作品已存在 ({} 条), 跳过初始化", count);
            return;
        }
        Game game = new Game();
        game.setGameId("lingxi");
        game.setName("灵汐云境");
        game.setSubtitle("LING XI");
        game.setCategory("云海童话 · 治愈冒险");
        game.setTagline("云海秘境 · 奇境漫游 · 治愈冒险");
        game.setSummary("穿过会涨潮的云隙，在风铃小镇歇脚，闯入树根朝天的森林与巨菇高地，唤醒镜子深处的守梦人。");
        game.setDescription("《灵汐云境》是一场落入云端童话的治愈冒险。旅人随星光潮汐穿过云隙，来到一片浮在云上的奇境：草原的风推着巨大的蒲公英，风铃镇的屋檐挂满铜铃，倒生森林的树根长向天空，蘑菇高地的露水能改变万物的尺寸。\n云境的梦源正在沉睡。自称乌有王的影子占了云镜神殿，把镜子后面的房间改成纸牌迷宫，想让整个世界忘掉自己的名字。你将挎着剑与四件随身百宝，穿过草原、小镇、森林与高地，解开关卡、结识伙伴，一步步走向神殿最深处。\n这里没有催你赶路的人。茶会永远不结束，热气球顺着风飞，每一条岔路都值得一走——毕竟，真正的宝贝从不放在大路上。");
        game.setUrl("http://lingxi.shixingxu.local");
        game.setCover("linear-gradient(180deg,#AEE3FF 0%,#D6F0FF 50%,#FFF6FB 100%)");
        game.setStyle("fairytale");
        game.setFeatured(1);
        game.setSort(10);
        game.setStatus(1);
        gameMapper.insert(game);
        log.info("已初始化灵汐云境游戏元数据");
    }

    private void seedCharacters() {
        Long count = characterMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("云境伙伴已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Character> list = new ArrayList<>();

        list.add(buildCharacter(
                "拾时", "怀表兔", "风铃镇", "向导", "低",
                "揣着一只星光怀表的灰耳兔，在云隙门口接引误闯此地的旅人。他总能算出下一次涨潮的时间，却总嫌别人走得太慢。",
                "linear-gradient(155deg,#EAF4FF 0%,#F0F8FF 45%,#FFF6FB 100%)",
                10
        ));

        list.add(buildCharacter(
                "杳笑", "雾纹猫", "倒生森林", "辅助", "中",
                "倒生森林里的雾纹猫，喜欢把自己隐身，只留下一个笑悬在半空。他知道森林里每条近路，但回答问题从来只说半句。",
                "linear-gradient(155deg,#F0F0FF 0%,#E8F4FF 45%,#F8F0FF 100%)",
                20
        ));

        list.add(buildCharacter(
                "蒲宁", "菇露翁", "蘑菇高地", "炼金", "中",
                "蘑菇高地最年长的菇人，红伞菇帽下藏着一张圆脸。他用清晨的露水酿药水——一口高过塔尖，再一口又能躲进草丛。",
                "linear-gradient(155deg,#FFF0E8 0%,#FFF8E7 45%,#F0FFF4 100%)",
                30
        ));

        list.add(buildCharacter(
                "红七", "纸牌逃兵", "风铃镇", "战士", "高",
                "从乌有王的纸牌军团里逃出来的小兵，把纸折的长枪擦得很亮。他听见鼓声就发抖，可伙伴遇险时，总是第一个站出来。",
                "linear-gradient(155deg,#FFE8F0 0%,#FFF0F5 45%,#F0F0FF 100%)",
                40
        ));

        list.add(buildCharacter(
                "月桂", "茶会主人", "风铃镇", "辅助", "低",
                "在小镇花园主持一场永不散场的茶会，帽子上摞着三只茶杯。她说话慢吞吞，烤的松饼却能瞬间恢复力气，路过的旅人都要被她拉住喝一杯。",
                "linear-gradient(155deg,#F8F0E0 0%,#FFF0F5 45%,#E8F8F0 100%)",
                50
        ));

        list.add(buildCharacter(
                "汐音", "守梦少女", "云镜神殿", "法师", "高",
                "云镜神殿最后的守梦人，为护住云境梦源陷入长眠。她沉睡在镜子深处，只有驱散乌有王的旅人，能听见她醒来时轻轻的一声叹息。",
                "linear-gradient(155deg,#E0E8FF 0%,#F0E8FF 45%,#E8F4FF 100%)",
                60
        ));

        list.forEach(characterMapper::insert);
        log.info("已初始化 {} 位云境伙伴", list.size());
    }

    private void seedSects() {
        Long count = sectMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("秘境已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Sect> list = new ArrayList<>();

        list.add(buildSect(
                "风铃镇", "云海边的风铃小镇", "铃声不停，小镇不散",
                "云海尽头的小镇，屋檐挂满铜铃，风一吹便此起彼伏。镇民守着茶会、杂货铺与热气球航线，是所有旅人歇脚的第一站。",
                "linear-gradient(150deg,#D6ECFF,#EAF4FF,#FFF6FB)",
                10
        ));

        list.add(buildSect(
                "倒生森林", "树根朝天的森林", "路在脚下，也在头顶",
                "一片树根朝天、树冠朝下生长的森林，雾霭终年不散。近路常常藏在头顶，会笑的雾猫是唯一的向导。",
                "linear-gradient(150deg,#D8F5E0,#E8F4FF,#F0F8FF)",
                20
        ));

        list.add(buildSect(
                "蘑菇高地", "巨菇如塔的高地", "大小之间，另有天地",
                "巨菇像塔一样林立的高地，露水会改变万物的尺寸。菇人们在伞盖之间架起吊桥，红伞菇帽下的炉火日夜不熄。",
                "linear-gradient(150deg,#FFE8D6,#FFF3D6,#F0FFF4)",
                30
        ));

        list.add(buildSect(
                "云镜神殿", "沉入梦底的神殿", "镜子照见的，不只是自己",
                "云境梦源所在的神殿，如今被乌有王改成纸牌迷宫。无数房间藏在镜子之后，钥匙、机关与纸牌卫兵拦住了所有来者。",
                "linear-gradient(150deg,#E0E8FF,#F0E8FF,#FFE8F0)",
                40
        ));

        list.forEach(sectMapper::insert);
        log.info("已初始化 {} 个秘境", list.size());
    }

    private void seedFeatures() {
        Long count = featureMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("玩法特色已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Feature> list = new ArrayList<>();

        list.add(buildFeature(
                "cloud", "云海漫游", "四境相通 · 自由探索",
                "草原、小镇、森林与高地无缝相连。循着铃声走，或偏离开阔地——每条岔路、每道裂缝后都可能藏着东西。",
                10
        ));

        list.add(buildFeature(
                "maze", "镜殿解谜", "房间制迷宫机关",
                "云镜神殿由一间间密室组成：推动机关、寻找小钥匙、隔着栅栏规划路线，才能抵达被封死的梦源。",
                20
        ));

        list.add(buildFeature(
                "sword", "随身百宝", "剑 · 回力镖 · 星弓 · 爆弹",
                "四种工具各有妙用：回力镖隔空取物、星弓远程先手、爆弹轰开裂缝。怎么组合，全看你自己。",
                30
        ));

        list.add(buildFeature(
                "bell", "风铃小镇", "商店 · 茶会 · 路人闲话",
                "在杂货铺补给，在花园蹭一顿下午茶，听镇民闲聊。他们提到的每个传闻，多半都是真的。",
                40
        ));

        list.add(buildFeature(
                "heart", "心之成长", "心心血量 · 碎片收集",
                "起初你只有三颗心。心之碎片散落在裂缝墙后、机关深处与宝箱之中，集齐四颗，便多一颗心。",
                50
        ));

        list.add(buildFeature(
                "star", "彩蛋奇遇", "炸墙 · 烧草 · 藏洞",
                "可疑的墙、可疑的草丛、可疑的水潭——云境奖励每一份好奇心，真正的宝贝从不放在大路上。",
                60
        ));

        list.forEach(featureMapper::insert);
        log.info("已初始化 {} 项玩法特色", list.size());
    }

    private void seedBanners() {
        Long count = bannerMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("Banner 已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<Banner> list = new ArrayList<>();

        list.add(buildBanner(
                "云境大门 10 月 15 日开启",
                "星光潮汐涨至最高，怀表兔在云隙门口等你",
                "linear-gradient(160deg,#AEE3FF 0%,#D6F0FF 55%,#FFF6FB 100%)",
                "#features", 10
        ));

        list.add(buildBanner(
                "云镜神殿前瞻",
                "钥匙、机关与纸牌卫兵，镜子后面的迷宫全解析",
                "linear-gradient(160deg,#C9B8F0 0%,#E8E0FF 55%,#F0F8FF 100%)",
                "#lore", 20
        ));

        list.add(buildBanner(
                "永不散场的下午茶",
                "松饼、莓果与方糖，9 月 28 日开席",
                "linear-gradient(160deg,#FFB7D1 0%,#FFE0EC 55%,#FFF8E7 100%)",
                "#news", 30
        ));

        list.forEach(bannerMapper::insert);
        log.info("已初始化 {} 条 Banner", list.size());
    }

    private void seedNews() {
        Long count = newsMapper.selectCount(new QueryWrapper<>());
        if (count != null && count > 0) {
            log.info("资讯已存在 ({} 条), 跳过初始化", count);
            return;
        }
        List<News> list = new ArrayList<>();

        list.add(buildNews(
                "云境大门 10 月 15 日开启",
                "星光潮汐当夜涨至最高，预约旅人可领怀表兔头像框与三颗星币糖。",
                "亲爱的旅人：\n云境大门将于 10 月 15 日正式开启。当夜星光潮汐涨至一月以来最高，云汐草原尽头的云隙会在潮声中完全显露——揣着怀表的灰耳兔会在门口接引各位，请认准他胸前的小铃铛。\n开服当日 20:00 至 22:00 登录的旅人，可在风铃镇杂货铺门口领取预约奖励：怀表兔头像框「滴答」一只、星币糖三颗，以及月桂亲手烤的开局松饼一份。松饼只能领一次，她说怕你们吃撑。\n如果你是第一次来，建议沿着草原小径先走到风铃镇：屋檐下的铜铃会替你记住回程的路。茶会永远不结束，杯子永远不空，我们云境见。",
                "notice",
                "linear-gradient(135deg,#AEDAF5,#D6ECFF)",
                LocalDateTime.of(2026, 10, 12, 10, 0)
        ));

        list.add(buildNews(
                "云镜神殿前瞻：钥匙、机关与纸牌卫兵",
                "镜子后面有什么？这篇带你提前看看梦源迷宫的房间规则。",
                "云镜神殿是云境梦源所在，如今迷宫重重。行前先看看这份房间规则，能少走不少回头路。\n神殿的房间由闸门分隔，闸门不会自己打开。清走房间里的纸牌卫兵，或找到角落里的星形机关并挥剑触发，闸门才会抬起——记得观察房间里有没有矮栅栏，栅栏挡得住人，却挡不住星弓射出的箭。\n上锁的门需要小钥匙，钥匙总在别的房间里：西翼的钥匙藏在清敌后的宝箱中，东翼则要靠回力镖隔空取物。门与钥匙环环相扣，建议每打开一道门就回头确认路线。\n神殿最深处，乌有王守在梦源之前。他倒下后才会出现通往核心的闸门。请攒够心，再推开那扇门。",
                "news",
                "linear-gradient(135deg,#C9B8F0,#E8F4FF)",
                LocalDateTime.of(2026, 10, 2, 11, 0)
        ));

        list.add(buildNews(
                "「永不散场的下午茶」9 月 28 日开席",
                "帮月桂收集方糖与莓果，兑换茶会帽、松饼背包与限定表情。",
                "月桂的茶会要办大了。9 月 28 日至 10 月 12 日，风铃镇花园每日开放方糖与莓果收集任务。\n方糖藏在小镇的陶罐与茶碟后面，莓果则要去倒生森林与蘑菇高地采集——雾猫答应不偷走放在树桩上的那些，他说这话时笑得很可疑。\n收集到的材料可在花园茶桌兑换：茶会帽「三只杯子」、松饼背包（背包容量 +4）、限定表情「再来一杯」，以及给伙伴红七的红茶套装。\n活动最后一天，月桂会亲自讲一个关于守梦少女的故事。她慢吞吞地说，你们慢慢等。",
                "activity",
                "linear-gradient(135deg,#F5B8D0,#FFE8C7)",
                LocalDateTime.of(2026, 9, 25, 15, 0)
        ));

        list.add(buildNews(
                "风铃小镇导游图：今天也替你探好了路",
                "杂货铺、茶会花园、热气球平台——一张图看懂小镇的全部好去处。",
                "风铃镇不大，够你逛一下午。这张导游图替你标好了全部好去处。\n进镇第一家是杂货铺，心药、爆弹与星箭都能在此补货，老板接受星币，偶尔也收你用不上的小玩意儿。\n沿铃声往东是茶会花园，松饼免费，热茶续杯，月桂拉住每个人讲镇上的传闻——据我们核实，那些传闻十有八九是真的。\n镇北高处是热气球平台，航线通往云汐草原与蘑菇高地，风大的时候会临时停航，站务员是一只戴帽子的胖麻雀。\n最后提醒：镇上每户屋檐都挂着铜铃，夜里听见铃声不要慌，那只是云境在替大家数回家的人。",
                "news",
                "linear-gradient(135deg,#9FE8C9,#D6F0FF)",
                LocalDateTime.of(2026, 9, 15, 9, 30)
        ));

        list.add(buildNews(
                "预约突破 100 万：全员加赠星光怀表",
                "百万预约达成！开服后全员可领取一只会自己滴答走的星光怀表挂件。",
                "今天，《灵汐云境》全平台预约人数正式突破 100 万。\n谢谢每一位打算来云境走走的旅人。除了既有预约奖励，我们决定全员加赠挂件「星光怀表」：一只会自己滴答走动的小怀表，挂在背包上，靠近隐藏的裂缝墙时会滴答得更快。\n挂件将在开服后通过邮件发放，全服每位旅人都有一份。\n云隙将开，风铃已响。10 月 15 日，我们在风铃镇等你。",
                "notice",
                "linear-gradient(135deg,#FFE3A3,#FFF3D6)",
                LocalDateTime.of(2026, 9, 5, 14, 0)
        ));

        list.forEach(newsMapper::insert);
        log.info("已初始化 {} 条资讯", list.size());
    }

    private Character buildCharacter(String name, String title, String faction, String role, String difficulty,
                                     String description, String cover, int sort) {
        Character c = new Character();
        c.setName(name);
        c.setTitle(title);
        c.setFaction(faction);
        c.setRole(role);
        c.setDifficulty(difficulty);
        c.setDescription(description);
        c.setCover(cover);
        c.setSort(sort);
        c.setStatus(1);
        return c;
    }

    private Sect buildSect(String name, String subtitle, String philosophy, String description, String cover, int sort) {
        Sect s = new Sect();
        s.setName(name);
        s.setSubtitle(subtitle);
        s.setPhilosophy(philosophy);
        s.setDescription(description);
        s.setCover(cover);
        s.setSort(sort);
        s.setStatus(1);
        return s;
    }

    private Feature buildFeature(String icon, String title, String summary, String description, int sort) {
        Feature f = new Feature();
        f.setIcon(icon);
        f.setTitle(title);
        f.setSummary(summary);
        f.setDescription(description);
        f.setSort(sort);
        f.setStatus(1);
        return f;
    }

    private Banner buildBanner(String title, String subtitle, String cover, String link, int sort) {
        Banner b = new Banner();
        b.setTitle(title);
        b.setSubtitle(subtitle);
        b.setCover(cover);
        b.setLink(link);
        b.setSort(sort);
        b.setStatus(1);
        return b;
    }

    private News buildNews(String title, String summary, String content, String category,
                           String coverImage, LocalDateTime publishTime) {
        News n = new News();
        n.setTitle(title);
        n.setSummary(summary);
        n.setContent(content);
        n.setCategory(category);
        n.setCoverImage(coverImage);
        n.setPublishTime(publishTime);
        n.setStatus(1);
        return n;
    }
}
