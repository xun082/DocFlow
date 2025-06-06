export interface ExifDateTime {
  _ctor: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond?: number;
  tzoffsetMinutes: number;
  rawValue: string;
  zoneName: string;
  inferredZone: boolean;
}

export interface BinaryField {
  _ctor: string;
  bytes: number;
  rawValue: string;
}

export interface ExifData {
  make: string;
  model: string;
  imageWidth: number;
  imageHeight: number;
  dateTimeOriginal: string;
  createDate: string;
  iso: number;
  aperture: number;
  shutterSpeed: string;
  focalLength: string;
  focalLengthIn35mmFormat: string;
  lensModel: string;
  lensId: string;
  colorSpace: string;
  whiteBalance: string;
  flash: string;
  meteringMode: string;
  exposureProgram: string;
  exposureCompensation: string;
  software: string;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gpsAltitude: number | null;
  artist: string | null;
  copyright: string | null;
  rawExifData: {
    // 基础文件信息
    SourceFile: string;
    errors: any[];
    zone: string;
    tz: string;
    tzSource: string;
    IntervalDurationHours: number;
    IntervalDurationMinutes: number;
    IntervalDurationSeconds: number;
    Orientation: number;
    ExifToolVersion: string;
    FileName: string;
    Directory: string;
    FileSize: string;
    FileModifyDate: ExifDateTime;
    FileAccessDate: ExifDateTime;
    FileInodeChangeDate: ExifDateTime;
    FilePermissions: string;
    FileType: string;
    FileTypeExtension: string;
    MIMEType: string;

    // EXIF基础信息
    ExifByteOrder: string;
    Make: string;
    Model: string;
    Software: string;
    ModifyDate: ExifDateTime;
    CreateDate: ExifDateTime;
    DateTimeOriginal: ExifDateTime;
    Artist: string;
    Copyright: string;

    // 图像基础属性
    ImageWidth: number;
    ImageHeight: number;
    BitsPerSample: number;
    Compression: string;
    PhotometricInterpretation: string;
    XResolution: number;
    YResolution: number;
    ResolutionUnit: string;

    // 拍摄参数
    ExposureTime: string;
    FNumber: number;
    ExposureProgram: string;
    ISO: number;
    SensitivityType: string;
    RecommendedExposureIndex: number;
    OffsetTime: string;
    OffsetTimeOriginal: string;
    OffsetTimeDigitized: string;
    ExposureCompensation: number;
    MeteringMode: string;
    LightSource: string;
    Flash: string;
    FocalLength: string;
    ShutterSpeed: string;
    Aperture: number;

    // 镜头信息
    LensInfo: string;
    LensMake: string;
    LensModel: string;
    LensSerialNumber: string;
    FocalLengthIn35mmFormat: string;

    // 相机设置
    Quality: string;
    WhiteBalance: string;
    FocusMode: string;
    ColorSpace: string;
    ExposureMode: string;
    SceneCaptureType: string;
    GainControl: string;
    Contrast: string;
    Saturation: string;
    Sharpness: string;
    SubjectDistanceRange: string;

    // 相机特定数据
    SerialNumber: number;
    ShutterCount: number;
    MechanicalShutterCount: number;
    FirmwareVersion: string;
    FirmwareVersion2: string;
    FirmwareVersion3: string;

    // 时间信息
    SubSecTime: number;
    SubSecTimeOriginal: number;
    SubSecTimeDigitized: number;
    PowerUpTime: ExifDateTime;
    SubSecCreateDate: ExifDateTime;
    SubSecDateTimeOriginal: ExifDateTime;
    SubSecModifyDate: ExifDateTime;

    // GPS信息
    GPSVersionID: string;

    // 二进制数据字段
    ContrastCurve: BinaryField;
    NEFLinearizationTable: BinaryField;
    JpgFromRaw: BinaryField;
    OtherImage: BinaryField;
    PreviewImage: BinaryField;
    ThumbnailTIFF: BinaryField;

    // 计算字段
    ImageSize: string;
    Megapixels: number;
    BlueBalance: number;
    RedBalance: number;
    ScaleFactor35efl: number;
    CFAPattern: string;
    AutoFocus: string;
    ContrastDetectAF: string;
    PhaseDetectAF: string;
    LensSpec: string;
    CircleOfConfusion: string;
    DOF: string;
    FOV: string;
    FocalLength35efl: string;
    HyperfocalDistance: string;
    LensID: string;
    LightValue: number;

    // 警告信息
    warnings: any[];

    // 其他可能的字段
    [key: string]: any;
  };
}

export interface FileInfo {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileHash: string;
  lastModified: string;
  previewUrl?: string;
}

export interface ImageMeta {
  fileInfo: FileInfo;
  exifData: ExifData;
}

// API响应相关类型
export interface GetImageMetadataParams {
  fileHash: string;
}

// 导出API调用相关的类型
export type ImageApiMethods = {
  GetImage: (data: any) => Promise<any>;
  GetImageMetadata: (fileHash: string) => Promise<{
    data: ImageMeta | null;
    error: string | null;
    status?: number;
  }>;
};
