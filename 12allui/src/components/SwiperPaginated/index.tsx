import React, {FC} from 'react';
import './styles.scss';
import {Swiper} from 'swiper/react';
import {Autoplay, Navigation, Pagination} from 'swiper';

type Props = {
  children: JSX.Element[];
};

const SwiperPaginated: FC<Props> = ({children}: Props) => {
  if (!children.length) {
    return null;
  }

  return (
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={4}
      autoplay={{
        delay: 10000,
        disableOnInteraction: false
      }}
      navigation
      pagination={{clickable: true}}
      className="swiper-paginated"
      loop={true}
    >
      {children}
    </Swiper>
  );
};

export default SwiperPaginated;
