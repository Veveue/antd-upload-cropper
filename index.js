import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Upload, Icon, Modal, message } from 'antd'

import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import axios from 'axios'

function getBase64 (img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

function beforeUpload (file) {
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片不能大于2MB!')
  }
  return isLt2M
}

class App extends React.Component {
	constructor (props) {
    super(props)

    this.state = {
      visible: false,
      imageUrl: props.file,
      naturalWidth: '',
      naturalHeight: '',
    }
  }
  _crop = () => {
    let canVS = this.refs.cropper && this.refs.cropper.getData()
    if (canVS) {
      this.setState({
        naturalWidth: parseInt(canVS.width),
        naturalHeight: parseInt(canVS.height),
      })
    }
  }
  render () {
    const { visible, imageUrl, naturalHeight, naturalWidth } = this.state
    const { tRatio, onUpload } = this.props


    const uploadProps = {
      accept: 'image/jpg,image/jpeg,image/png,image/bmp',
      action: '',
      showUploadList: false,
      beforeUpload: (info) => { beforeUpload(info) },
      customRequest: (info) => {
        getBase64(info.file, imageUrl => this.setState({ imageUrl }))
        this.setState({ visible: true })
      },
      onChange: (info) => {
        console.log('test')
      },
    }
    const modalProps = {
      title: '图片裁剪',
      visible,
      onOk: () => {
        this.setState({
          visible: false,
          imageUrl: this.refs.cropper.getCroppedCanvas().toDataURL(),
        })

        let params = new URLSearchParams()
        params.append('imgStr', this.refs.cropper.getCroppedCanvas().toDataURL())
        axios.post(uploadProps.action, params).then((res) => {
          if (res.data.result) {
            message.success('图片上传成功')
            onUpload(res.data.data)
          } else {
            message.error('图片上传失败')
          }
        })
      },
      onCancel: () => {
        this.setState({
          imageUrl: '',
          visible: false,
        })
      },
    }


    return (
      <div className="clearfix">
        <Upload
          className="avatar-uploader"
          name="avatar"
          {...uploadProps}
        >
          {
            imageUrl ?
              <img src={imageUrl} alt="" className="avatar" /> :
              <Icon type="plus" className="avatar-uploader-trigger" />
          }
        </Upload>
        <Modal {...modalProps}>
          <div className="imgwh">{naturalHeight} x {naturalWidth}px</div>
          <Cropper
            ref="cropper"
            src={imageUrl}
            style={{ height: 400, width: '100%' }}
            aspectRatio={tRatio}
            guides={false}
            crop={this._crop.bind(this)}
          />
        </Modal>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
