
import { GameIntensity } from './types';

export const ACTIONS: Record<GameIntensity, string[]> = {
  [GameIntensity.MILD]: [
    "Hôn nhẹ", "Massage vai", "Thổi nhẹ vào tai", "Thì thầm lời ngọt ngào", "Vuốt ve mái tóc", "Chạm nhẹ tay", "Nhìn sâu vào mắt"
  ],
  [GameIntensity.STEAMY]: [
    "Hôn nồng cháy", "Cắn nhẹ lên da", "Mơn trớn bằng đầu ngón tay", "Cởi một món đồ bất kỳ", "Dùng lưỡi vẽ vòng tròn", "Nếm hương nước hoa", "Massage với tinh dầu"
  ],
  [GameIntensity.WILD]: [
    "Bịt mắt và khám phá", "Dùng đá lạnh hoặc vật ấm", "Cởi một món đồ bằng răng", "Hôn khắp cơ thể", "Kích thích bằng hơi thở nóng", "Thực hiện một ảo tưởng nhỏ", "Quyền yêu cầu một hành động", "Mút", "Liếm", "Ngậm"
  ],
  [GameIntensity.EXTREME]: [
    "Thực hiện tư thế yêu thích nhất", "Dùng đồ chơi (nếu có)", "Spanking nhẹ nhàng", "Oral sex", "Thực hiện một kịch bản nhập vai", "Quyền kiểm soát hoàn toàn đối phương", "Yêu cầu một tư thế mới", "Kích thích điểm G", "Edging"
  ]
};

export const BODY_PARTS: Record<GameIntensity, string[]> = {
  [GameIntensity.MILD]: [
    "Má", "Trán", "Bàn tay", "Vai", "Tóc", "Cổ", "Mắt"
  ],
  [GameIntensity.STEAMY]: [
    "Xương quai xanh", "Sau tai", "Lưng trần", "Vòng eo", "Môi", "Cổ tay", "Gáy"
  ],
  [GameIntensity.WILD]: [
    "Đùi trong", "Bụng dưới", "Ngực", "Điểm nhạy cảm", "Nơi bạn muốn nhất", "Toàn thân", "Cô bé/ Cậu bé", "Ti"
  ],
  [GameIntensity.EXTREME]: [
    "Vùng kín", "Hậu môn", "Bên trong đùi", "Bên dưới ngực", "Điểm nhạy cảm nhất", "Mọi nơi bạn muốn", "Khu vực bí mật"
  ]
};

export const INTENSITY_COLORS = {
  [GameIntensity.MILD]: 'from-pink-400 to-rose-400',
  [GameIntensity.STEAMY]: 'from-rose-500 to-red-500',
  [GameIntensity.WILD]: 'from-red-600 to-purple-800',
  [GameIntensity.EXTREME]: 'from-purple-700 via-fuchsia-900 to-zinc-950'
};
