'use client';

import Image from 'next/image';

export default function SectionBenefits() {
  return (
    <div className="section-benefits" id="features">
      <div className="section-inner">
        <div className="section-header">
          <div className="eyebrow">Tính năng chính</div>
          <div className="section-title">Từ khoảng trống dữ liệu<br /><span>đến quyết định kịp thời</span></div>
          <div className="section-desc">
            Mekong Pathfinder gom dữ liệu ngập, cảnh báo và điều phối vào một luồng trải nghiệm rõ ràng cho người dân, tài xế và đội vận hành.
          </div>
        </div>

        <div className="benefits-stack">
          {/* Row 1 */}
          <section className="benefit-row">
            <div className="benefit-copy">
              <h3>Cảnh báo ngập chủ động</h3>
              <p>Ứng dụng theo dõi mưa, triều và báo cáo hiện trường để gửi cảnh báo sớm trước khi tuyến đường trở nên nguy hiểm.</p>
              <div className="benefit-points">
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  </div>
                  <div><h4>Cảnh báo theo vị trí</h4><p>Ưu tiên các điểm ngập gần nơi ở, trường học hoặc tuyến đường người dùng thường đi.</p></div>
                </div>
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                  </div>
                  <div><h4>Thông báo theo mức rủi ro</h4><p>Phân tầng nhẹ, vừa, nặng để người dân biết khi nào cần đổi lộ trình ngay.</p></div>
                </div>
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                  </div>
                  <div><h4>Cập nhật liên tục</h4><p>Dữ liệu mới được phản ánh vào trạng thái tuyến đường theo thời gian thực.</p></div>
                </div>
              </div>
            </div>
            <div className="benefit-visual">
              <Image
                src="/mockup-01.png"
                alt="Cảnh báo ngập chủ động"
                width={400}
                height={750}
                className="w-auto max-h-[620px] rounded-2xl shadow-lg"
              />
            </div>
          </section>

          {/* Row 2 */}
          <section className="benefit-row reverse">
            <div className="benefit-copy">
              <h3>Bản đồ ngập thời gian thực</h3>
              <p>Một bản đồ thống nhất giúp nhìn rõ điểm ngập, độ sâu ước tính và nguồn báo cáo thay vì theo dõi nhiều kênh rời rạc.</p>
              <div className="benefit-points">
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>
                  </div>
                  <div><h4>Lớp dữ liệu trực quan</h4><p>Hiển thị mưa, triều, cảm biến và báo cáo cộng đồng trên cùng một giao diện.</p></div>
                </div>
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div><h4>Xác thực điểm nóng</h4><p>Gắn nguồn dữ liệu để đội vận hành biết điểm nào cần kiểm tra và ưu tiên xử lý.</p></div>
                </div>
              </div>
            </div>
            <div className="benefit-visual">
              <Image
                src="/mockup-02.png"
                alt="Bản đồ ngập thời gian thực"
                width={400}
                height={750}
                className="w-auto max-h-[620px] rounded-2xl shadow-lg"
              />
            </div>
          </section>

          {/* Row 3 */}
          <section className="benefit-row">
            <div className="benefit-copy">
              <h3>Điều phối phản ứng nhanh</h3>
              <p>Dashboard giúp chính quyền và đội phản ứng nhìn thấy điểm nóng, phân công xử lý và cập nhật trạng thái minh bạch hơn.</p>
              <div className="benefit-points">
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  </div>
                  <div><h4>Dashboard tập trung</h4><p>Tổng hợp mức ngập, số báo cáo và trạng thái xử lý theo từng phường, tuyến đường.</p></div>
                </div>
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                  </div>
                  <div><h4>Phân công rõ ràng</h4><p>Ghi nhận đội phụ trách, thời điểm tiếp nhận và kết quả xử lý để giảm thao tác thủ công.</p></div>
                </div>
                <div className="benefit-point">
                  <div className="benefit-icon">
                    <svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></svg>
                  </div>
                  <div><h4>Phản hồi cộng đồng</h4><p>Người dân có thể gửi ảnh, xác nhận tình trạng và nhận lại cập nhật sau xử lý.</p></div>
                </div>
              </div>
            </div>
            <div className="benefit-visual">
              <Image
                src="/mockup-03.png"
                alt="Điều phối phản ứng nhanh"
                width={400}
                height={750}
                className="w-auto max-h-[620px] rounded-2xl shadow-lg"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}