import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCrop from 'react-image-crop';

import 'react-image-crop/dist/ReactCrop.css';

class CroppedImage extends Component {

  static propTypes = {
    src: PropTypes.string.isRequired,
    crop: PropTypes.object.isRequired,
    fileName: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    updateImages: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      crop: props.crop
    }
  }

  onImageLoaded = (image) => {
    this.imageRef = image;
  };

  state = {
    croppedImage: {},
  };

  onCropChange = (crop) => {
    this.setState({ crop });
  };

  onCropComplete = (crop) => {
    if (this.imageRef && crop.width && crop.height) {
      this.getCroppedImg(this.imageRef, crop);
    }
  };

  getCroppedImg(image, crop) {
    const { id } = this.props;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    ctx.canvas.toBlob((blob) => {
      const { fileName } = this.props;
      const resizedfile = new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      const lastDot = fileName.lastIndexOf('.');
      const name = `${fileName.substring(0, lastDot)}`;
      const imageName = `${name}_${crop.width}_${crop.height}`;

      this.setState({croppedImage: { image: resizedfile, name: imageName }});
      this.props.updateImages({id , image: resizedfile, name: imageName });
    }, 'image/jpeg', 1);
  }

  render() {
    const { src, id } = this.props;
    const { crop } = this.state;
    return(
      <div>
        <h2>{`${id} [ Size: ${crop.width} X ${crop.height}]`}</h2>
        <ReactCrop
          src={src}
          crop={crop}
          onImageLoaded={this.onImageLoaded}
          onComplete={this.onCropComplete}
          onChange={this.onCropChange}
        />
      </div>
    );
  }
}

export default CroppedImage;

