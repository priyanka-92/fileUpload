import React, { Component } from 'react';
import request from 'superagent';

import './App.css';
import CroppedImage from "./components/CroppedImage";
import { IMG_PATH, UPLOAD_PATH } from "./config";

class App extends Component {

  state = {
    error: '',
    fileName: '',
    src: null,
    dimensions: [
      { id: 'Horizontal', width: 755, height: 450 },
      { id: 'Vertical', width: 365, height: 450 },
      { id: 'Horizontal Small', width: 365, height: 212 },
      { id: 'Gallery', width: 380, height: 380 },
    ],
    images: {},
    showUploadedImages: false
  };

  getFileDimensions = (file) =>
    new Promise((resolve, reject) => {
      try {
        let img = new Image();

        img.onload = () => {
          const width  = img.naturalWidth,
            height = img.naturalHeight;

          window.URL.revokeObjectURL(img.src);

          return resolve({ width, height })
        };

        img.src = window.URL.createObjectURL(file);
      } catch (exception) {
        return reject(exception)
      }
    });

  saveImage = () => {
    const vm = this;
    const url = UPLOAD_PATH;
    const { images } = this.state;
    const promises = [];
    for (let key in images) {
      const promise = new Promise((resolve, reject) =>
        request.post(url)
          .field('upload_preset', 't3gxjnjo')
          .field('file', images[key].image)
          .field('folder', 'images')
          .field('public_id', images[key].name)
          .end((error, response) => {
            resolve();
          })
      );
      promises.push(promise);
    }
    Promise.all(promises).then(resp => {
      vm.setState({ src: '', showUploadedImages: true });
      alert('Uploaded successfully');
    });
  };

  updateImages = (image) => {
    const { id, ...rest } = image;
    this.setState({
      images: {
        ...this.state.images,
        [image.id]: {...rest}
      }
    })
  };

  handleFile = e => {
    const file = e.target.files[0];
    this.getFileDimensions(file).then(({ width, height }) => {
      if (!( width === 1024 && height === 1024 )) {
        this.setState(
          { error: `Please upload a file of appropriate size: Actual Size ( ${width}X${height} ) Required Size ( 1024X1024 )` })
      } else {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          this.setState({src: fileReader.result, fileName: file.name, error: '' })
        };
        fileReader.readAsDataURL(file);
      }
    });
  };

  render() {
    const { error, src, dimensions, fileName, showUploadedImages } = this.state;
    return (
      <div className="app">
        <div className={showUploadedImages ? '' : 'container'}>
          <div>
            <h1>{showUploadedImages ? 'Uploaded files' : 'Upload file'}</h1>
          </div>
          {
            !showUploadedImages ?
              <div>
                <input type='file' accept="image/*" onChange={this.handleFile} name='file' />
              </div> : null
          }
          {
            error ?
              <span className='error'>{error}</span> : null
          }
        </div>
        {src ?
          <div>
            <h2>Preview Images</h2>
            {
              dimensions.map(size =>
                <div key={size.id}>
                  <CroppedImage
                    updateImages={this.updateImages}
                    id={size.id}
                    fileName={fileName}
                    src={src}
                    crop={{ width: size.width, height: size.height, unit: 'px' }} />
                </div>
              )
            }
          </div> : null
        }
        {
          showUploadedImages ?
            dimensions.map(size => {
              const lastDot = fileName.lastIndexOf('.');
              const name = `${fileName.substring(0, lastDot)}`;
              return (
                <div>
                  <h2>{size.id}</h2>
                  <img src={`${IMG_PATH}/${fileName.replace(name, `${name}_${size.width}_${size.height}`)}`} alt=''/>
                </div>)
            }) : null
        }
        {
          src ?
            <div className='btn_container'>
              <button className='sec-btn' type='button' onClick={this.saveImage}>Upload Images</button>
            </div>: null
        }
      </div>
    );
  }
}

export default App;
