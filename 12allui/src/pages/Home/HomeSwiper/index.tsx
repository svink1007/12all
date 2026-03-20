import {FC, PropsWithChildren} from 'react';
import './styles.scss';
import {Navigation} from 'swiper';
import {Swiper} from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';

interface Props extends PropsWithChildren {
  onNavigationNext?: (swiper: SwiperClass) => void
}

const HomeSwiper: FC<Props> = ({children, onNavigationNext}: Props) => {
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      breakpoints={{
        640: {
          slidesPerView: 2,
          slidesPerGroup: 2
        },
        768: {
          slidesPerView: 4,
          slidesPerGroup: 4
        },
        1024: {
          slidesPerView: 6,
          slidesPerGroup: 6
        }
      }}
      navigation
      modules={[Navigation]}
      className="home-swiper"
      onNavigationNext={onNavigationNext}
    >
      {children}
    </Swiper>
  );
};

export default HomeSwiper;
