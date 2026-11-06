# -*- coding: utf-8 -*-
"""
請以繁體中文產生程式碼註解。請務必保持 UTF-8 編碼。

程式名稱：HTTP 分段讀取檔案
功能說明：把遠端檔案包成可 seek 的檔案物件，每次只用 HTTP Range 下載需要的區段。
          讓 pyarrow 只讀 parquet 的某幾欄、某幾組資料，不用整個檔案下載。

建立日期：2026-11-05
版本號：v0.1.0
"""

import io
import urllib.request


class HttpRangeFile(io.RawIOBase):
    """只用 HTTP Range 讀取需要的區段。"""

    def __init__(self, url, timeout_secs=120):
        request = urllib.request.Request(url, method="HEAD")
        response = urllib.request.urlopen(request, timeout=timeout_secs)
        self.url = response.geturl()
        self.size = int(response.headers["Content-Length"])
        self.pos = 0
        self.timeout_secs = timeout_secs

    def seekable(self):
        return True

    def readable(self):
        return True

    def tell(self):
        return self.pos

    def seek(self, offset, whence=0):
        if whence == 0:
            self.pos = offset
        elif whence == 1:
            self.pos += offset
        else:
            self.pos = self.size + offset
        return self.pos

    def read(self, n=-1):
        if n is None or n < 0:
            n = self.size - self.pos
        if n == 0 or self.pos >= self.size:
            return b""
        end = min(self.size, self.pos + n) - 1
        request = urllib.request.Request(self.url, headers={"Range": f"bytes={self.pos}-{end}"})
        data = urllib.request.urlopen(request, timeout=self.timeout_secs).read()
        self.pos += len(data)
        return data

    def readinto(self, buffer):
        data = self.read(len(buffer))
        buffer[: len(data)] = data
        return len(data)
