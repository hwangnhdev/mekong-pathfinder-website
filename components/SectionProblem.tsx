export default function SectionProblem() {
  return (
    <div className="section-problem" id="problem">
      <div className="section-inner">
        <div className="section-header">
          <div className="eyebrow">Vấn đề</div>
          <div className="section-title">Mỗi trận mưa lớn đều tạo ra<br /><span>một khoảng trống dữ liệu</span></div>
          <div className="section-desc">Ngập đô thị không chỉ là nước dâng. Vấn đề nằm ở việc thông tin đến chậm, rời rạc và khó biến thành quyết định kịp thời cho người dân lẫn đội điều phối.</div>
        </div>
        <div className="problem-summary">
          <div className="problem-summary-item">
            <strong>01</strong>
            <span>Thiếu cảnh báo trước khi tuyến đường trở nên nguy hiểm.</span>
          </div>
          <div className="problem-summary-item">
            <strong>02</strong>
            <span>Dữ liệu hiện trường phân tán giữa nhiều nguồn khác nhau.</span>
          </div>
          <div className="problem-summary-item">
            <strong>03</strong>
            <span>Phản ứng đô thị phụ thuộc nhiều vào ghi nhận thủ công.</span>
          </div>
        </div>
        <div className="problems-grid">
          <div className="problem-card red">
            <div className="problem-img">
              <div className="problem-img-label">Ngập đột ngột</div>
              <div className="problem-signal"><span></span><span></span><span></span></div>
              <div className="problem-stat">
                <strong>Phút đầu</strong>
                <span>là thời điểm rủi ro nhất</span>
              </div>
            </div>
            <div className="problem-body">
              <h3>Không có cảnh báo đủ sớm</h3>
              <p>Người dân không biết trước điểm ngập, dẫn đến kẹt xe, hư xe, thậm chí tai nạn nguy hiểm khi nước dâng bất ngờ trong đêm.</p>
            </div>
          </div>
          <div className="problem-card yellow">
            <div className="problem-img">
              <div className="problem-img-label">Thông tin phân tán</div>
              <div className="problem-signal"><span></span><span></span><span></span></div>
              <div className="problem-stat">
                <strong>Rời rạc</strong>
                <span>khó nhìn toàn cảnh theo thời gian thực</span>
              </div>
            </div>
            <div className="problem-body">
              <h3>Thiếu bản đồ ngập thời gian thực</h3>
              <p>Dữ liệu ngập nằm rải rác ở nhiều sở ban ngành, không tập trung, không trực quan — người dân và tài xế không thể tra cứu nhanh.</p>
            </div>
          </div>
          <div className="problem-card teal">
            <div className="problem-img">
              <div className="problem-img-label">Lộ trình mù</div>
              <div className="problem-signal"><span></span><span></span><span></span></div>
              <div className="problem-stat">
                <strong>Đi vòng</strong>
                <span>hoặc đi thẳng vào vùng ngập sâu</span>
              </div>
            </div>
            <div className="problem-body">
              <h3>Ứng dụng bản đồ không biết ngập</h3>
              <p>Google Maps, Apple Maps không tích hợp dữ liệu ngập địa phương — thường dẫn tài xế đi thẳng vào các tuyến đường ngập sâu.</p>
            </div>
          </div>
          <div className="problem-card pink">
            <div className="problem-img">
              <div className="problem-img-label">Quản lý thủ công</div>
              <div className="problem-signal"><span></span><span></span><span></span></div>
              <div className="problem-stat">
                <strong>Chậm nhịp</strong>
                <span>khi cần ưu tiên điểm nóng ngay lập tức</span>
              </div>
            </div>
            <div className="problem-body">
              <h3>Chính quyền thiếu dữ liệu tổng hợp</h3>
              <p>Cán bộ đô thị phải ghi chép thủ công, không có dashboard tổng hợp để ra quyết định điều phối ứng phó lũ nhanh chóng.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}