# Roadmap

Các hạng mục đã hoàn thành và hướng phát triển của Lingua Lab. Chưa gắn mốc thời gian cho các mục dự kiến.

## ✅ Đã hoàn thành — Sản phẩm

| Hạng mục | Nội dung |
|---|---|
| **Lộ trình học tiếng Nhật** | Trang Nihongo tập hợp các nội dung học hiện có. |
| **Kana** | Nhận biết Hiragana, Katakana và Romaji; có phần luyện tập và hướng dẫn viết. |
| **Ngữ pháp** | Học mẫu câu, chủ đề giới thiệu bản thân và các dạng câu hỏi. |
| **Từ vựng: thời gian** | Chủ đề Time với lịch mẫu cố định, ngày/tháng, mốc ngày/đêm, buổi, tần suất và cách đọc giờ/phút. |
| **Từ vựng: giới thiệu lần đầu** | Từ và cách diễn đạt về tên, con người, nghề nghiệp, xuất xứ và lần gặp đầu tiên. |
| **Lối vào phần học tiếng Anh** | Tiếng Anh đã xuất hiện trên trang chọn ngôn ngữ với trạng thái “sắp ra mắt”. |

## ✅ Đã hoàn thành — Kỹ thuật & phát hành

| Hạng mục | Nội dung |
|---|---|
| **CI cho pull request** | Workflow kiểm tra các thay đổi phù hợp trước khi merge vào `master`. |
| **Phát hành production** | Quy trình tạo release branch, build, yêu cầu phê duyệt, deploy lên GitHub Pages và xác minh các route sau deploy. |
| **Rollback** | Workflow khôi phục một bản phát hành ổn định đã lưu, sau đó xác minh site được khôi phục. |
| **Tài liệu vận hành** | Có hướng dẫn trước/sau phát hành, phát hành và rollback; tài liệu tham chiếu mô tả topology ứng dụng, CI, delivery và các bước kiểm chứng. |

## 🔜 Dự kiến

Thực hiện **Bảng chữ số → Từ vựng thời gian → Grammar bổ trợ → Mở rộng câu hỏi thời gian**. Grammar bổ trợ gồm ba bài theo thứ tự **Động từ lịch sự → Nối danh từ → Thời gian & địa điểm**; phần địa điểm sẽ bổ sung sau khi có nội dung bài học mới. Phần học tiếng Anh là định hướng tương lai.

**Quy ước chung cho các bài mới**

- Nhãn giao diện, nghĩa và phần giải thích dùng **tiếng Anh**, đồng nhất với các bài hiện tại.
- Chữ Nhật có Kanji phải kèm cách đọc bằng Hiragana hoặc Katakana và Romaji. Các mục viết bằng Kana cũng kèm Romaji.
- Cách đọc thay thế và biến âm phải được thể hiện rõ. Dùng màu và chữ đậm để nhấn mạnh, giữ cách nhấn nhất quán giữa các bài.
- Nội dung dưới đây mô tả yêu cầu đầy đủ; không cần ảnh hoặc video trong cuộc trò chuyện để triển khai. Đối chiếu cách đọc tiếng Nhật với nguồn học đáng tin cậy khi xây dựng dữ liệu bài học.

**ID checklist:** Mỗi task có một ID duy nhất theo nhóm nội dung. Giữ nguyên ID khi đổi thứ tự, chuyển mục hoặc đánh dấu hoàn thành; task mới dùng số tiếp theo trong nhóm, không đánh lại số hoặc tái sử dụng ID đã cấp.

### Bảng chữ số

Bài riêng **Numbers** trên trang Nihongo, đứng trước **Vocabulary** trong danh sách bài học. Bảng chính chỉ hiển thị con số và cách đọc bằng Kana, Romaji; ví dụ đặt riêng bên dưới bảng.

**Bố cục bảng**

| Cột | Nội dung từ trên xuống |
|---|---|
| 1 | 1, 2, 3, …, 9 |
| 2 | 10, 20, 30, …, 90 |
| 3 | 100, 200, 300, …, 900 |
| 4 | 1,000, 2,000, 3,000, …, 9,000 |
| 5 | 10,000, 20,000, 30,000, …, 90,000 |

Mỗi cột có chín mục, cùng một hàng ứng với cùng hệ số 1–9. Số nổi bật, Kana và Romaji dễ đọc. Tô màu và in đậm cách đọc thay thế hoặc phần biến âm khác quy tắc; ví dụ dưới bảng được nhóm theo các hàng số đã học.

**Checklist**

- [ ] `NUM-001` Chuẩn bị đủ 45 mục số cùng cách đọc Kana, Romaji và các cách đọc thay thế phù hợp.
- [ ] `NUM-002` Tạo bảng năm cột, mỗi cột chín mục theo bố cục trên.
- [ ] `NUM-003` Tô màu và in đậm cách đọc thay thế hoặc phần biến âm khác quy tắc.
- [ ] `NUM-004` Đặt ví dụ ghép số riêng bên dưới bảng, kèm Kana và Romaji, có ví dụ tương ứng cho từng hàng số.
- [ ] `NUM-005` Tạo bài Numbers và thêm thẻ bài học đứng trước Vocabulary trên trang Nihongo.
- [ ] `NUM-006` Kiểm tra các cột và cách đọc trên màn hình nhỏ; bảo đảm không mất nội dung khi cuộn bảng.
- [ ] `NUM-007` Kiểm tra mở bài từ trang Nihongo, quay lại danh sách bài học và tải lại URL trực tiếp.

### Từ vựng thời gian — đã hoàn thành

Bài hiện có tại `/nihongo-o-benkyuo/vocabulary/time`, với ngày mẫu **October 15, 2026**. Liên kết học tiếp mở nhóm **When & what time?** hiện có; bổ sung liên kết Grammar khi các bài bổ trợ được triển khai. Kiểm tra desktop/mobile, mở trực tiếp và tải lại URL đã qua trên Chromium, Firefox và WebKit.

Chủ đề **Time** trong Vocabulary. Dùng **một ngày mẫu cố định** làm mốc “today”; ghi rõ đây là lịch mẫu phục vụ học tập. Chọn tháng có 31 ngày và ngày mẫu ở giữa tháng để cả năm mốc ngày/đêm đều nằm trong lịch. Lưu ngày mẫu trong dữ liệu bài học, mọi mốc tương đối được tính từ ngày này.

**Bố cục bài học**

Toàn bộ nội dung nằm trong **cùng một khung lịch**. Các ngày, mốc tương đối, buổi và tần suất xuất hiện ngay trên lịch. Phần **đọc giờ và phút** nằm cạnh hoặc dưới lịch tháng, vẫn thuộc khung lịch; ví dụ ghép giờ-phút đặt bên dưới phần này.

**Nội dung cần có**

- **Các ngày trong tuần:** đủ Monday–Sunday trên tiêu đề cột lịch.
- **Ngày và tháng:** cách đọc ngày 1–31 trong tháng và đủ January–December trong phần tháng của khung lịch.
- **Mốc ngày:** the day before yesterday, yesterday, today, tomorrow, the day after tomorrow — gắn vào năm ngày tương ứng quanh ngày mẫu.
- **Mốc ban đêm:** the night before last, last night, tonight, tomorrow night, the night after next — gắn vào phần ban đêm của năm ngày tương ứng.
- **Buổi trong ngày:** morning, afternoon, evening, night; có nhãn riêng để phân biệt buổi chiều, buổi tối và ban đêm, dùng icon mặt trời/mặt trăng kèm chữ.
- **Tần suất:** every morning, every afternoon, every evening, every day, every night; biểu diễn một lần tại phần buổi/ngày tương ứng của ngày mẫu trong khung lịch.
- **Giờ và phút:** giờ 1時–12時 và bảng phút 1分–10分; đồng hồ tương tác cho phép chọn phút 0–59, mỗi mục có Kana và Romaji. Giải thích cách đọc 分 là *ふん/ぷん* và biến âm theo số; thêm 何分（なんぷん, *nanpun*）với nghĩa “what minute?”. Nhấn màu/in đậm cách đọc đặc biệt; cách đọc ghép giờ-phút cập nhật theo hai kim và hiển thị dưới đồng hồ.
- **Cách diễn đạt giờ:** 午前（ごぜん, *gozen* — a.m.）, 午後（ごご, *gogo* — p.m.）và 半（はん, *han* — half past）trong phần đọc giờ để chuẩn bị cho các mẫu hỏi đáp.

**Checklist**

- [x] `TIME-001` Chuẩn bị đủ các nhóm nội dung ở trên, kèm Kana, Romaji và nghĩa tiếng Anh.
- [x] `TIME-002` Chọn ngày mẫu cố định; bố trí đúng thứ và ngày trong tháng, tính năm mốc ngày/đêm từ ngày mẫu thay vì ngày hiện tại của thiết bị.
- [x] `TIME-003` Tạo khung lịch chứa ngày trong tuần, ngày trong tháng và đủ tên/cách đọc 12 tháng.
- [x] `TIME-004` Gắn các mốc ngày/đêm vào đúng ô ngày và sắp theo thứ tự trước đây → hiện tại → sắp tới.
- [x] `TIME-005` Thể hiện các buổi và tần suất ngay trên lịch; dùng icon mặt trời/mặt trăng kèm nhãn chữ rõ nghĩa.
- [x] `TIME-006` Thêm bảng đọc 12 giờ và 10 phút trong cùng khung lịch, kèm đồng hồ tương tác để đọc các phút còn lại, nhấn cách đọc đặc biệt và giải thích quy tắc 分.
- [x] `TIME-007` Hiển thị cách đọc ghép giờ-phút dưới đồng hồ tương tác, kèm Kana và Romaji.
- [x] `TIME-008` Bổ sung a.m./p.m. và cách nói half past vào phần đọc giờ trong khung lịch.
- [x] `TIME-009` Tạo chủ đề Time và liên kết từ trang Vocabulary.
- [x] `TIME-010` Thêm liên kết học tiếp tới nhóm câu hỏi thời gian trong Grammar → Question types và các bài Grammar bổ trợ khi nội dung đích đã có.
- [x] `TIME-011` Kiểm tra đọc đủ nội dung trên màn hình nhỏ, bao gồm các mốc ngày/đêm và bảng giờ/phút.
- [x] `TIME-012` Kiểm tra mở bài từ Vocabulary, quay lại danh sách chủ đề và tải lại URL trực tiếp; mốc “today” luôn là ngày mẫu cố định.
- [x] `TIME-013` Tạo đồng hồ tương tác kéo kim giờ/phút, có thanh điều chỉnh dùng bàn phím, lựa chọn a.m./p.m., cách đọc riêng từng kim và cách đọc kết hợp; thêm half past ở phút 30.

### Mở rộng câu hỏi thời gian

Mở rộng nhóm **When & what time?** hiện có trong **Grammar → Question types**. Bài Vocabulary → Time dẫn tới nhóm này để người học chuyển từ nhận biết từ vựng sang đặt câu hỏi. Các mẫu có liên kết tới bài Grammar giải thích cấu trúc tương ứng.

**Nội dung cần có**

| Tình huống | Mẫu câu cần học |
|---|---|
| Hỏi giờ hiện tại | 今、何時ですか — *Ima, nanji desu ka?* |
| Hỏi giờ của sự kiện | N は 何時ですか — *N wa nanji desu ka?*; câu trả lời có giờ, phút, a.m./p.m. hoặc half past. |
| Biết giờ, hỏi phần phút | N は X時何分ですか — *N wa X-ji nanpun desu ka?*; trả lời thời điểm cụ thể. |
| Hỏi giờ thực hiện hành động | 何時に V-ますか／何時に V-ましたか — *Nanji ni V-masu ka? / Nanji ni V-mashita ka?*; ví dụ giờ thức dậy, đi ngủ, kết thúc buổi họp. |
| Hỏi khoảng giờ, điểm bắt đầu hoặc kết thúc | 何時から何時まで V-ますか — *Nanji kara nanji made V-masu ka?*; thêm mẫu chỉ hỏi 何時から hoặc 何時まで. |
| Hỏi khoảng ngày trong tuần | 何曜日から何曜日まで V-ますか — *Nan-yōbi kara nan-yōbi made V-masu ka?*; ví dụ các ngày làm việc. |

Giữ các mẫu **いつ** (*itsu*) hiện có và giải thích lựa chọn từ hỏi: *itsu* hỏi khi nào, *nanji* hỏi giờ, *nanpun* hỏi phần phút, *nan-yōbi* hỏi thứ trong tuần. Ví dụ về thói quen, kế hoạch và hành động đã xảy ra phải dùng đuôi động từ phù hợp; hiện tại/thói quen và tương lai cùng dùng dạng non-past.

**Checklist**

- [ ] `TIME-Q-001` Mở rộng nhóm When & what time? với đủ sáu tình huống trong bảng, giữ các mẫu đang có.
- [ ] `TIME-Q-002` Mỗi tình huống có công thức, ít nhất một cặp câu hỏi–trả lời, Kana, Romaji và nghĩa tiếng Anh.
- [ ] `TIME-Q-003` Bổ sung ví dụ a.m./p.m., half past, thói quen, kế hoạch và hành động đã xảy ra ở các tình huống phù hợp.
- [ ] `TIME-Q-004` Phân biệt câu hỏi thời điểm/sự kiện dùng です với giờ thực hiện hành động dùng に + động từ.
- [ ] `TIME-Q-005` Phân biệt hỏi phút của một thời điểm với hỏi độ dài thời gian trong nhóm How long hiện có.
- [ ] `TIME-Q-006` Liên kết từng nhóm mẫu tới bài Grammar bổ trợ, đồng thời thêm đường học tiếp từ Vocabulary → Time.
- [ ] `TIME-Q-007` Kiểm tra điều hướng tới đúng nhóm câu hỏi, cách đọc và bố cục trên màn hình nhỏ.

### Grammar bổ trợ

Ba bài riêng nằm trong **Grammar**, theo thứ tự dưới đây. Các bài giải thích cấu trúc và có ví dụ ứng dụng; mẫu hỏi đáp được liên kết với nhóm câu hỏi thời gian.

**1. Động từ lịch sự — Polite verb forms**

Giải thích câu có vị ngữ danh từ và câu có vị ngữ động từ; liên hệ phần です đã học. Dạy bốn dạng **ます／ません／ました／ませんでした**, phân biệt khẳng định/phủ định và non-past/past. Dạng non-past diễn đạt thói quen hoặc kế hoạch tương lai tùy ngữ cảnh.

- [ ] `GR-VERB-001` Tạo bài Polite verb forms trên trang Grammar.
- [ ] `GR-VERB-002` Trình bày bảng bốn dạng, làm nổi bật phần đuôi thay đổi và kèm Kana/Romaji.
- [ ] `GR-VERB-003` Dùng các động từ phục vụ lịch sinh hoạt: thức dậy, đi ngủ, làm việc, nghỉ, học và kết thúc.
- [ ] `GR-VERB-004` Có ví dụ khẳng định/phủ định ở hiện tại, tương lai và quá khứ; giải thích ngữ cảnh xác định ý nghĩa thời gian.
- [ ] `GR-VERB-005` Liên kết tới các câu hỏi giờ thực hiện hành động và bài Thời gian & địa điểm.

**2. Nối danh từ — Connecting nouns**

Dạy **N1 と N2** (*N1 to N2*) để nối hai danh từ. Ví dụ chính gồm các ngày nghỉ trong tuần; thêm ví dụ nối người hoặc vật để cho thấy cấu trúc dùng được ngoài chủ đề thời gian. Giải thích danh từ 休み（やすみ, *yasumi*）và động từ 休みます（やすみます, *yasumimasu*）trong hai cách diễn đạt ngày nghỉ.

- [ ] `GR-NOUN-001` Tạo bài Connecting nouns trên trang Grammar, sau Polite verb forms.
- [ ] `GR-NOUN-002` Giải thích và minh họa と nối danh từ, kèm Kana/Romaji và nghĩa tiếng Anh.
- [ ] `GR-NOUN-003` Có ví dụ các ngày nghỉ và ví dụ nối người hoặc vật.
- [ ] `GR-NOUN-004` So sánh câu dùng danh từ 休み + です với câu dùng động từ 休みます.
- [ ] `GR-NOUN-005` Liên kết tới bài Thời gian & địa điểm để giải thích cách dùng に khi nói về các ngày trong tuần.

**3. Thời gian & địa điểm — Time & place**

Một bài chung cho cách diễn đạt thời gian và địa điểm. **Giai đoạn hiện tại triển khai phần thời gian**: thời điểm với に, cách đưa thời gian thành chủ đề bằng は, khoảng thời gian với から・まで. Phần địa điểm sẽ bổ sung sau khi người dùng học bài mới và chốt phạm vi.

- [ ] `GR-TIME-001` Tạo bài Time & place trên trang Grammar, sau Connecting nouns; xác định rõ phần thời gian đang có và phần địa điểm dự kiến.
- [ ] `GR-TIME-002` Giải thích **thời điểm + に + động từ**, phân biệt với câu chỉ nói giờ hiện tại/sự kiện bằng です.
- [ ] `GR-TIME-003` Có ví dụ cần に với giờ/ngày cụ thể, có thể dùng hoặc bỏ に với ngày trong tuần, và thường không dùng に với các mốc tương đối như today/tomorrow hoặc tần suất every day.
- [ ] `GR-TIME-004` Có ví dụ đưa ngày/thời gian thành chủ đề bằng は, như “as for today”.
- [ ] `GR-TIME-005` Dạy **A から B まで** (*A kara B made*), có ví dụ khoảng giờ, khoảng ngày trong tuần và khoảng ngủ qua đêm.
- [ ] `GR-TIME-006` Giải thích から và まで có thể dùng riêng; có ví dụ chỉ nêu điểm bắt đầu hoặc kết thúc.
- [ ] `GR-TIME-007` Liên kết tới câu hỏi 何時に, 何時から／まで và 何曜日から／まで trong Question types.

**Địa điểm — bổ sung sau**

- [ ] `GR-PLACE-001` Chốt nội dung phần địa điểm sau khi người dùng học bài mới, rồi mở rộng trong cùng bài Time & place.

**Kiểm tra chung cho Grammar bổ trợ**

- [ ] `GR-QA-001` Cả ba bài có liên kết từ trang Grammar và đường quay lại danh sách bài học.
- [ ] `GR-QA-002` Công thức, ví dụ, câu hỏi và câu trả lời đều tuân theo quy ước tiếng Anh + Kana + Romaji.
- [ ] `GR-QA-003` Kiểm tra bố cục trên màn hình nhỏ, các liên kết học tiếp và tải lại URL trực tiếp.

### Phần học tiếng Anh

Phát triển nội dung học tiếng Anh bên cạnh mục giới thiệu “sắp ra mắt”. Cần xác định chủ đề và phạm vi bài học trước khi triển khai.

> Chuyển một mục sang **Đã hoàn thành** khi tính năng đã có thể sử dụng trong ứng dụng. Chỉ thêm mốc thời gian khi đã thống nhất.
